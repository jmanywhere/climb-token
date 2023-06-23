// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)

// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface IClimb is IERC20 {
    function sellFee() external view returns (uint256);

    function burn(uint256 amount) external;

    function sell(
        uint256 amount,
        address stable
    ) external returns (uint stableReceived);

    function sell(
        address recipient,
        uint256 amount,
        address stable
    ) external returns (uint stableReceived);

    function sellAll(address _stable) external;

    // These functions are used to buy CLIMB with STABLE, STABLE will need to be approved for transfer in for this contract.
    function buy(uint256 numTokens, address stable) external returns (uint256);

    function buy(
        address recipient,
        uint256 numTokens,
        address stable
    ) external returns (uint256);

    /// @notice although this function has the same parameters as the BUY functions, only Matrix contracts can call this function
    /// @dev the Matrix contract MUST send STABLE tokens to this contract before calling this function. Without this function, the Matrix contract would have to receive STABLE tokens from the user, then approve STABLE tokens to the contract to buy CLIMB token and then CLIMB would need to transfer STABLE back to themselves. This function saves gas and time.
    function buyFor(
        address recipient,
        uint256 numTokens,
        address stable
    ) external returns (uint256);

    function eraseHoldings(uint256 nHoldings) external;

    function volumeFor(address wallet) external view returns (uint256);

    function calculatePrice() external view returns (uint256);

    function stables(
        address _stable
    )
        external
        view
        returns (
            uint balance,
            uint8 index,
            uint8 decimals,
            bool accepted,
            bool setup
        );

    function allStables() external view returns (address[] memory);

    ///@notice this function is called by OWNER only and is used to exchange the complete balance in STABLE1 for STABLE2
    function exchangeTokens(
        address stable1,
        address stable2,
        address _router
    ) external;

    // owner functions
    function setMatrixContract(address newMatrix, bool exempt) external;

    ///////////////////////////////////
    //////        EVENTS        ///////
    ///////////////////////////////////

    event UpdateShares(uint256 updatedDevShare, uint256 updatedLiquidityShare);
    event UpdateFees(
        uint256 updatedSellFee,
        uint256 updatedMintFee,
        uint256 updatedTransferFee
    );
    event UpdateDevAddress(address updatedDev);
    event SetMatrixContract(address newMatrix, bool exempt);
    event PriceChange(
        uint256 previousPrice,
        uint256 currentPrice,
        uint256 totalSupply
    );
    event ErasedHoldings(address who, uint256 amountTokensErased);
    event GarbageCollected(uint256 amountTokensErased);
    event UpdateTokenSlippage(uint256 newSlippage);
    event TransferOwnership(address newOwner);
    event TokenStaked(uint256 assetsReceived, address recipient);
    event SetFeeExemption(address Contract, bool exempt);
    event TokenActivated(uint256 totalSupply, uint256 price, uint256 timestamp);
    event TokenSold(
        uint256 amountCLIMB,
        uint256 assetsRedeemed,
        address recipient
    );
    event TokenPurchased(uint256 assetsReceived, address recipient);
    event SetStableToken(address stable, bool exempt);
    event ExchangeToken(
        address _from,
        address _to,
        uint256 amountFROM,
        uint256 amountTO
    );
}

interface IOwnableClimb is IClimb {
    function owner() external returns (address);
}

//SPDX-License-Identifer: MIT

interface IBinanceWealthMatrix {
    function user(
        address _user
    )
        external
        view
        returns (
            uint256 miners,
            uint256 totalInvested, // This is in CLIMB
            uint256 totalRedeemed, // This is in CLIMB
            uint256 eggsToClaim,
            uint256 lastInteraction,
            address referrer
        );
}

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
        IERC20(_stable).transfer(msg.sender, liquidatorReward);
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
        IERC20(_stable).transfer(msg.sender, totalReward);
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

        users[_user] = User(0, 0, 0, 0, 0, address(0));
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

    /**
     * Get all the available amount to be extracted from users by liquidating them from the pool
     * @param liquidableUsers The users to calculate the available liquidation from
     */
    function getAvailableLiquidationFromUsers(
        address[] calldata liquidableUsers
    ) external view returns (uint) {
        uint totalLiquidation = 0;
        uint climbPrice = climb.calculatePrice();
        for (uint i = 0; i < liquidableUsers.length; i++) {
            User memory user = users[liquidableUsers[i]];
            if (user.depositAmount == 0 || climbPrice < user.endPrice) continue;
            totalLiquidation +=
                (user.climbAmount * climbPrice * 95) /
                100 ether;
            totalLiquidation -=
                (user.climbAmount * user.endPrice * 95) /
                100 ether;
        }
        return totalLiquidation;
    }
}
