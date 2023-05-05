// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IClimb.sol";
import "./interfaces/IUniswapV2Router02.sol";

contract BinanceWealthMatrix is Ownable, ReentrancyGuard {
    struct Mining {
        uint256 miners;
        uint256 totalInvested; // This is in CLIMB
        uint256 totalRedeemed; // This is in CLIMB
        uint256 eggsToClaim;
        uint256 lastInteraction;
        address referrer;
    }
    mapping(address => Mining) public user;

    uint256 public constant EGGS_TO_HATCH_1MINERS = 2592000;
    uint256 public constant MAX_VAULT_TIME = 12 hours;

    uint256 public constant PSN = 10000;
    uint256 public constant PSNH = 5000;
    uint256 public marketEggs;

    address public feeReceiver;
    address public climb;

    IOwnableClimb public immutable CLIMB;
    bool public initialized = false;

    constructor(address _climbToken, address _receiver) {
        CLIMB = IOwnableClimb(_climbToken);
        feeReceiver = _receiver;
    }

    // Invest with USDT
    function investInMatrix(
        address ref,
        address _stable,
        uint256 stableAmount
    ) public nonReentrant {
        require(initialized, "Matrix is not initialized");
        IERC20 stable = IERC20(_stable);

        uint256 previousBalance = CLIMB.balanceOf(address(this));
        // We transfer _stable straight to CLIMB for a single transfer TX
        stable.transferFrom(msg.sender, address(CLIMB), stableAmount);
        uint amount = CLIMB.buyFor(address(this), stableAmount, _stable);
        // ----------------------------
        // ----------------------------
        uint256 eggsBought = calculateEggBuy(amount, previousBalance);

        Mining storage miner = user[msg.sender];

        eggsBought -= devFee(eggsBought);

        // send referral eggs before adding in claimable eggs
        _checkAndSetRef(ref, miner);
        _sendRefAmount(miner.referrer, eggsBought / 10);

        eggsBought += miner.eggsToClaim;
        miner.eggsToClaim = 0;

        uint256 newMiners = eggsBought / EGGS_TO_HATCH_1MINERS;
        miner.miners += newMiners;

        miner.totalInvested += amount;
        miner.lastInteraction = block.timestamp;

        // boost market to nerf miners hoarding (MINER)
        marketEggs += eggsBought / 5;
        emit Invest(msg.sender, amount);
    }

    function _checkAndSetRef(address _ref, Mining storage miner) private {
        if (_ref == msg.sender) {
            _ref = address(0);
        }
        if (miner.referrer == address(0) && _ref != address(0)) {
            miner.referrer = _ref;
        }
    }

    function _sendRefAmount(address _ref, uint amount) private {
        if (_ref != address(0)) {
            user[_ref].eggsToClaim += amount;
        }
    }

    // Reinvest in Matrix
    function reinvestInMatrix(address ref) public nonReentrant {
        require(initialized, "Matrix is not initialized");
        Mining storage miner = user[msg.sender];
        _checkAndSetRef(ref, miner);

        uint256 eggsUsed = getEggs(msg.sender);
        uint256 eggsValue = calculateEggSell(eggsUsed);
        uint256 fee = devFee(eggsValue);
        eggsValue -= fee;

        uint256 newMiners = (eggsUsed - devFee(eggsUsed)) /
            EGGS_TO_HATCH_1MINERS;

        // boost market to nerf miners hoarding
        eggsUsed /= 5; // 20% of total eggs
        marketEggs += eggsUsed;
        // send Referral eggs
        eggsUsed /= 2; // 10% of total eggs
        _sendRefAmount(miner.referrer, eggsUsed);

        miner.miners += newMiners;
        miner.eggsToClaim = 0;
        miner.totalInvested += eggsValue;
        miner.lastInteraction = block.timestamp;

        // handle the fee
        uint256 dFee = fee / 5;
        fee -= dFee;

        CLIMB.burn(fee);
        CLIMB.transfer(feeReceiver, dFee);
        // boost market to nerf miners hoarding
        // Actual eggs value reinvested
        emit Reinvest(msg.sender, eggsValue);
    }

    // Withdraw Stable
    function matrixRedeem() public nonReentrant {
        require(initialized, "Matrix is not initialized");
        Mining storage miner = user[msg.sender];
        uint256 hasEggs = getEggs(msg.sender);
        uint256 eggsValue = calculateEggSell(hasEggs);
        miner.eggsToClaim = 0;
        miner.lastInteraction = block.timestamp;
        miner.totalRedeemed += eggsValue;
        marketEggs += hasEggs;
        uint currentClimbPrice = CLIMB.calculatePrice();
        uint stableAdjustable = (eggsValue * currentClimbPrice) / 1 ether;
        eggsValue = _sellEggs(stableAdjustable, eggsValue, msg.sender);
        emit Redeem(msg.sender, eggsValue);
    }

    function _sellEggs(
        uint stableGoal,
        uint climbToSell,
        address recipient
    ) private returns (uint valueOfSell) {
        address[] memory allStables = CLIMB.allStables();
        for (uint i = 0; i < allStables.length; i++) {
            (uint balance, , uint8 _precision, , ) = CLIMB.stables(
                allStables[i]
            );
            balance = (balance * 1 ether) / (10 ** _precision);
            if (balance >= stableGoal) {
                return CLIMB.sell(recipient, climbToSell, allStables[i]);
            } else {
                uint climbAmount = (climbToSell * balance) / stableGoal;
                stableGoal -= balance;
                climbToSell -= climbAmount;
                if (climbAmount > 0)
                    valueOfSell += CLIMB.sell(
                        recipient,
                        climbAmount,
                        allStables[i]
                    );
            }
        }
    }

    //magic trade balancing algorithm
    function calculateTrade(
        uint256 rt,
        uint256 rs,
        uint256 bs
    ) public pure returns (uint256) {
        //(PSN*bs)/(PSNH+((PSN*rs+PSNH*rt)/rt));
        return (PSN * bs) / (PSNH + ((PSN * rs + PSNH * rt) / rt));
    }

    function calculateEggSell(uint256 eggs) public view returns (uint256) {
        return calculateTrade(eggs, marketEggs, CLIMB.balanceOf(address(this)));
    }

    function calculateEggBuy(
        uint256 amount,
        uint256 contractBalance
    ) public view returns (uint256) {
        return calculateTrade(amount, contractBalance, marketEggs);
    }

    function calculateEggBuySimple(
        uint256 amount
    ) public view returns (uint256) {
        return calculateEggBuy(amount, CLIMB.balanceOf(address(this)));
    }

    function devFee(uint256 amount) public pure returns (uint256) {
        return (amount * 5) / 100;
    }

    function initializeMatrix() public onlyOwner {
        require(marketEggs == 0, "Market eggs not zero");
        initialized = true;
        marketEggs = 25920000000;
        emit Initialize(block.timestamp);
    }

    function getBalance() public view returns (uint256) {
        return CLIMB.balanceOf(address(this));
    }

    function getMiners(address _user) public view returns (uint256) {
        return user[_user].miners;
    }

    function getEggs(address _user) public view returns (uint256) {
        return user[_user].eggsToClaim + getEggsSinceLastHatch(_user);
    }

    function getEggsSinceLastHatch(address adr) public view returns (uint256) {
        Mining storage currentUser = user[adr];
        uint256 secondsPassed = min(
            MAX_VAULT_TIME,
            (block.timestamp - currentUser.lastInteraction)
        );
        return secondsPassed * currentUser.miners;
    }

    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }

    event Initialize(uint256 timeStamp);
    event Invest(address indexed user, uint256 climbAmount);
    event Redeem(address indexed user, uint256 climbAmount);
    event Reinvest(address indexed user, uint256 climbAmount);
}
