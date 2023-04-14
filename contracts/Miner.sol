// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IClimb.sol";
import "./interfaces/IUniswapV2Router02.sol";

contract BinanceWealthMatrix is Ownable {
    struct Mining {
        uint256 miners;
        uint256 totalInvested; // This is in CLIMB
        uint256 totalRedeemed; // This is in CLIMB
        uint256 eggsToClaim;
        uint256 lastInteraction;
        address referrer;
    }
    mapping(address => bool) public acceptedStables;
    mapping(address => Mining) public user;

    uint256 public constant EGGS_TO_HATCH_1MINERS = 2592000;
    uint256 public constant MAX_VAULT_TIME = 43200; // 12 hours
    address public constant USDT_ADDRESS =
        0x55d398326f99059fF775485246999027B3197955;
    address public constant BUSD_ADDRESS =
        0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;

    uint256 public constant PSN = 10000;
    uint256 public constant PSNH = 5000;
    bool public initialized = false;
    address public feeReceiver;
    address payable climb;
    IOwnableClimb public immutable CLIMB;
    IERC20 USDT = IERC20(USDT_ADDRESS);
    mapping(address => uint256) public hatcheryMiners;
    mapping(address => uint256) public totalInvested;
    mapping(address => uint256) public totalRedeemed;
    mapping(address => uint256) public claimedEggs;
    mapping(address => uint256) public lastHatch;
    mapping(address => address) public referrals;
    uint256 public marketEggs;

    constructor(address _climbToken) {
        CLIMB = IOwnableClimb(_climbToken);
        feeReceiver = CLIMB.owner();
        acceptedStables[USDT_ADDRESS] = true;
        acceptedStables[BUSD_ADDRESS] = true;
    }

    // Invest with USDT
    function investInMatrix(
        address ref,
        address _stable,
        uint256 stableAmount
    ) public {
        require(initialized, "Matrix is not initialized");
        require(acceptedStables[_stable], "Not accepted");
        IERC20 stable = IERC20(_stable);

        // @audit this requires 2 transfers, let's try to make it just one by calling CLAIM `BUY FOR`
        // BUY FOR should only be allowed by matrix contracts or other allowed contracts
        // ----------------------------
        stable.transferFrom(msg.sender, address(this), stableAmount);
        require(
            stable.balanceOf(address(this)) > 0,
            "Stable token not received"
        );
        uint256 previousBalance = CLIMB.balanceOf(address(this));
        stable.approve(address(CLIMB), stableAmount);
        // TODO Make sure BUY returns the amount of CLIMB bought
        uint newBalance = CLIMB.buy(address(this), stableAmount, _stable);
        // ----------------------------
        // ----------------------------
        uint256 amount = newBalance - previousBalance;
        uint256 eggsBought = calculateEggBuy(amount, previousBalance);

        Mining storage miner = user[msg.sender];

        eggsBought -= devFee(eggsBought);
        eggsBought += miner.eggsToClaim;
        miner.eggsToClaim = 0;

        uint256 newMiners = eggsBought / EGGS_TO_HATCH_1MINERS;
        miner.miners += newMiners;

        miner.totalInvested += amount;
        miner.lastInteraction = block.timestamp;

        // send referral eggs
        _checkAndSetRef(ref, miner);
        if (miner.referrer != address(0)) {
            user[miner.referrer].eggsToClaim += (eggsBought / 10);
        }
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

    // Reinvest in Matrix
    function reinvestInMatrix(address ref, address _stable) public {
        require(initialized, "Matrix is not initialized");
        require(acceptedStables[_stable], "Not accepted");
        Mining storage miner = user[msg.sender];
        _checkAndSetRef(ref, miner);

        uint256 eggsUsed = getMyEggs();
        uint256 eggsValue = calculateEggSell(eggsUsed);
        uint256 fee = devFee(eggsValue);
        eggsValue -= fee;

        uint256 newMiners = (eggsUsed - devFee(eggsUsed)) /
            EGGS_TO_HATCH_1MINERS;

        miner.miners += newMiners;
        miner.eggsToClaim = 0;
        miner.totalInvested += eggsValue;
        miner.lastInteraction = block.timestamp;

        // handle the fee
        uint256 dFee = fee / 5;
        fee -= dFee;

        CLIMB.burn(fee);
        CLIMB.sell(address(feeReceiver), dFee, _stable);

        // send referral eggs
        claimedEggs[referrals[msg.sender]] += (eggsUsed / 10);

        // boost market to nerf miners hoarding
        marketEggs += (eggsUsed / 5);
        // Actual eggs value reinvested
        emit Reinvest(msg.sender, eggsValue);
    }

    // Withdraw Stable
    function matrixRedeem(address _preferredStable) public {
        require(initialized, "Matrix is not initialized");
        require(acceptedStables[_preferredStable], "Not accepted");
        Mining storage miner = user[msg.sender];
        uint256 hasEggs = getMyEggs();
        uint256 eggsValue = calculateEggSell(hasEggs);
        miner.eggsToClaim = 0;
        miner.lastInteraction = block.timestamp;
        miner.totalRedeemed += eggsValue;
        marketEggs += hasEggs;
        // TODO - add a check for the preferred stable
        // todo - ADD the argument for preferred stable in CLIMB token
        CLIMB.sell(msg.sender, eggsValue, _preferredStable);
        emit Redeem(msg.sender, eggsValue);
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

    function getMyMiners() public view returns (uint256) {
        return hatcheryMiners[msg.sender];
    }

    function getMyEggs() public view returns (uint256) {
        return claimedEggs[msg.sender] + getEggsSinceLastHatch(msg.sender);
    }

    function getEggsSinceLastHatch(address adr) public view returns (uint256) {
        uint256 secondsPassed = min(
            MAX_VAULT_TIME,
            (block.timestamp - lastHatch[adr])
        );
        return secondsPassed * hatcheryMiners[adr];
    }

    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }

    event Initialize(uint256 timeStamp);
    event Invest(address indexed user, uint256 climbAmount);
    event Redeem(address indexed user, uint256 climbAmount);
    event Reinvest(address indexed user, uint256 climbAmount);
}
