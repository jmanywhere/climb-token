// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import "openzeppelin/token/ERC20/IERC20.sol";
import "openzeppelin/access/Ownable.sol";
import "./IClimb.sol";
import "./IBinanceWealthMatrix.sol";

//--------------------------------------------
// Errors
//--------------------------------------------
error MoneyMarket__InvalidDepositAmount(uint deposited);
error MoneyMarket__UserAlreadyHasDeposit();
error MoneyMarket__InvalidStableAddress();
error MoneyMarket__UserHasNoDeposit();
error MoneyMarket__UserHasNoProfit();
error MoneyMarket__UserHasProfit();
error MoneyMarket__MaxClimbAmountReached(
    uint _maxLimit,
    uint _amountToIncreaseTo
);
error MoneyMarket__InvalidProfitThresholds(uint _preferred, uint _regular);

/**
 * @title BinanceWealthMatrix Money Market
 * @author Semi Invader
 * @notice This contract is made to give users the power to interact with the BWM Climb Token with expected rewards.
 */
contract MoneyMarket is Ownable {
    //--------------------------------------------
    // Type Definitions
    //--------------------------------------------
    struct User {
        uint participationIndex;
        uint depositAmount;
        uint climbAmount;
        uint startingPrice;
        uint endPrice;
        address preferredToken;
    }
    //----------------------------------------------
    // State Variables
    //----------------------------------------------
    mapping(address _user => User info) public users;
    address[] participants;
    IClimb public climb;
    IBinanceWealthMatrix public bwm;
    uint public PREFERRED_PROFIT = 5;
    uint public REGULAR_PROFIT = 3;
    uint public PENALTY_FEE = 10;
    uint public BURN_FEE = 1;
    uint public MAX_CLIMB_IN_MARKET = 25;
    uint public MIN_DEPOSIT = 100 ether;
    uint public minForPreferred = 500 ether; // 500$ worth of CLIMB invested
    uint private p_totalDeposits;
    uint private p_totalWithdrawals;
    uint private constant PERCENTAGE = 100;
    uint private constant CLIMB_PERCENTAGE = 1000;

    //----------------------------------------------
    // Events
    //----------------------------------------------
    event Deposit(
        address indexed _user,
        address indexed _stableAddress,
        uint indexed _Profit,
        uint _stableAmount
    );
    event Liquidate(
        address indexed _liquidatedUser,
        address indexed _stableLiquidated,
        uint indexed _liquidatedAmount
    );
    event LiquidatorReward(
        address indexed _liquidator,
        uint indexed _rewardAmount
    );
    event EarlyFeeTaken(address indexed _user, uint indexed _feeAmountInClimb);
    event EditProfits(uint indexed _preferred, uint indexed _regular);
    event EditFees(uint indexed _penalty, uint indexed _burn);
    event EditMinDeposit(uint indexed _newDepositMin);
    event EditThreshold(uint indexed _newThreshold);

    //----------------------------------------------
    // Constructor
    //----------------------------------------------
    constructor(address _climb, address _bwm) {
        climb = IClimb(_climb);
        bwm = IBinanceWealthMatrix(_bwm);
    }

    //----------------------------------------------
    // External Functions
    //----------------------------------------------

    function deposit(uint _stableAmount, address _stableAddress) external {
        (, , , bool accepted, ) = climb.stables(_stableAddress);

        if (!accepted) revert MoneyMarket__InvalidStableAddress();
        if (_stableAmount < MIN_DEPOSIT || _stableAmount % 1 ether > 0)
            revert MoneyMarket__InvalidDepositAmount(_stableAmount);

        User storage user = users[msg.sender];

        if (user.depositAmount > 0) revert MoneyMarket__UserAlreadyHasDeposit();
        user.participationIndex = participants.length;
        participants.push(msg.sender);

        (uint profit, uint price) = _getUserProfitAndPrice(msg.sender);
        uint sellFee = climb.sellFee();

        user.startingPrice = price;
        user.depositAmount = _stableAmount;
        user.preferredToken = _stableAddress;
        p_totalDeposits += _stableAmount;

        IERC20 stable = IERC20(_stableAddress);
        stable.transferFrom(msg.sender, address(climb), _stableAmount);
        uint climbAmount = climb.buyFor(
            address(this),
            _stableAmount,
            _stableAddress
        );
        _checkMaxClimbAmount();

        uint burnAmount = (climbAmount * BURN_FEE) / PERCENTAGE;
        climbAmount -= burnAmount;
        climb.burn(burnAmount);
        user.climbAmount = climbAmount;

        user.endPrice = _calculateEndPrice(
            _stableAmount,
            profit,
            climbAmount,
            sellFee
        );
        emit Deposit(msg.sender, _stableAddress, profit, _stableAmount);
    }

    function liquidate(address _userToLiquidate, address _stable) external {
        uint liquidatorReward = _liquidateUser(_userToLiquidate, _stable);
        emit LiquidatorReward(msg.sender, liquidatorReward);
    }

    function liquidateMany(
        address[] calldata _users,
        address _stable
    ) external {
        uint totalReward;
        for (uint i = 0; i < _users.length; i++) {
            totalReward += _liquidateUser(_users[i], _stable);
        }
        emit LiquidatorReward(msg.sender, totalReward);
    }

    function selfLiquidate(address _preferredStable) external {
        User storage user = users[msg.sender];
        if (user.depositAmount == 0) revert MoneyMarket__UserHasNoDeposit();

        uint climbPrice = climb.calculatePrice();

        if (climbPrice < user.endPrice) revert MoneyMarket__UserHasNoProfit();

        uint tokenAmount = climb.sell(
            msg.sender,
            user.climbAmount,
            _preferredStable
        );
        p_totalWithdrawals += tokenAmount;
        _removeParticipant(user.participationIndex);
        users[msg.sender] = User(0, 0, 0, 0, 0, address(0));
        emit Liquidate(msg.sender, _preferredStable, tokenAmount);
    }

    function forceSelfLiquidate(address _preferredStable) external {
        User storage user = users[msg.sender];
        if (user.depositAmount == 0) revert MoneyMarket__UserHasNoDeposit();

        uint climbPrice = climb.calculatePrice();

        if (climbPrice > user.endPrice) revert MoneyMarket__UserHasProfit();
        // Take EarlyFee and withdraw
        climbPrice = (user.climbAmount * PENALTY_FEE) / PERCENTAGE;
        user.climbAmount -= climbPrice;

        climb.burn(climbPrice);

        emit EarlyFeeTaken(msg.sender, climbPrice);

        uint tokenAmount = climb.sell(
            msg.sender,
            user.climbAmount,
            _preferredStable
        );
        p_totalWithdrawals += tokenAmount;
        _removeParticipant(user.participationIndex);
        users[msg.sender] = User(0, 0, 0, 0, 0, address(0));
        emit Liquidate(msg.sender, _preferredStable, tokenAmount);
    }

    function editProfitThresholds(
        uint _newPreferred,
        uint _newReg
    ) external onlyOwner {
        if (_newPreferred < _newReg)
            revert MoneyMarket__InvalidProfitThresholds(_newPreferred, _newReg);
        PREFERRED_PROFIT = _newPreferred;
        REGULAR_PROFIT = _newReg;
        emit EditProfits(_newPreferred, _newReg);
    }

    function editFee(uint _newPenalty, uint _newBurn) external onlyOwner {
        PENALTY_FEE = _newPenalty;
        BURN_FEE = _newBurn;
        emit EditFees(_newPenalty, _newBurn);
    }

    function editMinDeposit(uint _newMinDepositAmount) external onlyOwner {
        MIN_DEPOSIT = _newMinDepositAmount;
        emit EditMinDeposit(_newMinDepositAmount);
    }

    function editMaxThreshold(uint _newThreshold) external onlyOwner {
        MAX_CLIMB_IN_MARKET = _newThreshold;
        emit EditThreshold(_newThreshold);
    }

    //----------------------------------------------
    // External & Public view functions
    //----------------------------------------------
    function totalDeposits() external view returns (uint) {
        return p_totalDeposits;
    }

    function totalWithdrawals() external view returns (uint) {
        return p_totalWithdrawals;
    }

    //----------------------------------------------
    // Internal view functions
    //----------------------------------------------

    function _liquidateUser(
        address _user,
        address _stable
    ) internal returns (uint) {
        User storage user = users[_user];
        if (user.depositAmount == 0) revert MoneyMarket__UserHasNoDeposit();

        uint climbPrice = climb.calculatePrice();

        if (climbPrice < user.endPrice) revert MoneyMarket__UserHasNoProfit();

        uint liquidationAmount = climb.sell(
            address(this),
            user.climbAmount,
            _stable
        );
        p_totalWithdrawals += liquidationAmount;
        uint expectedAmount = (liquidationAmount * user.endPrice) / climbPrice;
        liquidationAmount -= expectedAmount;

        _removeParticipant(user.participationIndex);
        IERC20 stable = IERC20(_stable);

        stable.transfer(_user, expectedAmount);

        users[msg.sender] = User(0, 0, 0, 0, 0, address(0));
        emit Liquidate(_user, _stable, expectedAmount);
        return liquidationAmount;
    }

    function _getUserProfitAndPrice(
        address _user
    ) internal view returns (uint profit, uint climbPrice) {
        (, uint investedClimb, , , , ) = bwm.user(_user);
        climbPrice = climb.calculatePrice();

        investedClimb = (investedClimb * climbPrice) / 1 ether; // Double eth values

        if (investedClimb >= minForPreferred) profit = PREFERRED_PROFIT;
        else profit = REGULAR_PROFIT;
    }

    /**
     * Removes a participant from the participants array
     * @param index The index of the user to remove from the participants array
     * @dev only to be called when a user is liquidated
     */
    function _removeParticipant(uint index) internal {
        uint lastIndex = participants.length - 1;
        address lastParticipant = participants[lastIndex];
        participants[index] = lastParticipant;
        participants.pop();
        users[lastParticipant].participationIndex = index;
    }

    /**
     * @notice This function checks that current CLIMB in the market is not above MAX_CLIMB_IN_MARKET percentage of the Matrix total CLIMB
     */
    function _checkMaxClimbAmount() internal view {
        uint climbInMatrix = climb.balanceOf(address(bwm));
        climbInMatrix = (climbInMatrix * MAX_CLIMB_IN_MARKET) / PERCENTAGE;
        uint currentClimb = climb.balanceOf(address(this));
        if (climbInMatrix < currentClimb)
            revert MoneyMarket__MaxClimbAmountReached(
                climbInMatrix,
                currentClimb
            );
    }

    //----------------------------------------------
    // Private pure functions
    //----------------------------------------------
    function _calculateEndPrice(
        uint investment,
        uint profit,
        uint climbAmount,
        uint sellFee
    ) private pure returns (uint) {
        uint investmentProfit = (investment * profit) / PERCENTAGE;
        investment += investmentProfit;
        return
            ((investment * CLIMB_PERCENTAGE) * 1 ether) /
            (climbAmount * (CLIMB_PERCENTAGE - sellFee));
    }

    //----------------------------------------------
    // External view functions
    //----------------------------------------------

    function getTotalUsers() external view returns (uint) {
        return participants.length;
    }

    function getUsersAvailForLiquidation()
        external
        view
        returns (address[] memory)
    {
        uint participantsLength = participants.length;
        if (participantsLength == 0) return new address[](0);
        address[] memory usersAvailForLiquidation = new address[](
            participantsLength
        );
        uint indexOfInserts = 0;
        for (uint i = 0; i < participantsLength; i++) {
            User memory user = users[participants[i]];
            if (user.depositAmount == 0) continue;
            uint climbPrice = climb.calculatePrice();
            if (climbPrice < user.endPrice) continue;
            usersAvailForLiquidation[indexOfInserts] = participants[i];
            indexOfInserts++;
        }
        return usersAvailForLiquidation;
    }
}
