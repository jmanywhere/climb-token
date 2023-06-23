// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/IClimb.sol";
import "../src/IBinanceWealthMatrix.sol";
import "../src/MoneyMarket.sol";

contract MMTest is Test {
    MoneyMarket mm;
    IClimb climb = IClimb(0xE1a5ADD8401DFb161adb35D120CF15DBb81F0B1D);
    IBinanceWealthMatrix bwm =
        IBinanceWealthMatrix(0x174B2958095665b9afdB52c8a5372547f5C1d8AF);
    address USER_PREF = 0x4BE5ecc076C7DB235b97264D480dCc9C1a57dc7b;
    address USER_REG = makeAddr("user_reg");
    address LIQUIDATOR = makeAddr("liquidator");
    address VOLUME_MAKER = makeAddr("volume_maker");
    address BUSD_WHALE = 0xF977814e90dA44bFA03b6295A0616a897441aceC;
    address USDT_WHALE = 0x8894E0a0c962CB723c1976a4421c95949bE2D4E3;
    address CLIMB_OWNER = 0x1D225C878f53f6E4846D29c37F4A4F7d69c3CDaC;

    IERC20 USDT = IERC20(0x55d398326f99059fF775485246999027B3197955);
    IERC20 BUSD = IERC20(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56);

    event EarlyFeeTaken(address indexed user, uint indexed amountBurned);
    event Liquidate(
        address indexed _liquidatedUser,
        address indexed _stableLiquidated,
        uint indexed _liquidatedAmount
    );

    function setUp() public {
        mm = new MoneyMarket(address(climb), address(bwm));

        vm.startPrank(BUSD_WHALE);
        BUSD.transfer(USER_PREF, 100_000 ether);
        BUSD.transfer(USER_REG, 100_000 ether);
        BUSD.transfer(VOLUME_MAKER, 100_000 ether);
        vm.startPrank(USDT_WHALE);
        USDT.transfer(USER_PREF, 100_000 ether);
        USDT.transfer(USER_REG, 100_000 ether);
        USDT.transfer(VOLUME_MAKER, 100_000 ether);
        vm.startPrank(USER_PREF);
        BUSD.approve(address(mm), 100_000 ether);
        USDT.approve(address(mm), 100_000 ether);
        vm.startPrank(USER_REG);
        BUSD.approve(address(mm), 100_000 ether);
        USDT.approve(address(mm), 100_000 ether);
        vm.stopPrank();
        vm.prank(CLIMB_OWNER);
        climb.setMatrixContract(address(mm), true);
    }

    function test_deposit_preferred() public {
        uint currentPrice = climb.calculatePrice();
        uint currentSupply = climb.totalSupply();

        vm.startPrank(USER_PREF);
        mm.deposit(1000 ether, address(BUSD));
        vm.stopPrank();

        currentSupply = climb.totalSupply() - currentSupply;
        (
            ,
            uint depositAmount,
            uint climbAmount,
            uint startingPrice,
            uint endPrice,
            address _stable
        ) = mm.users(USER_PREF);
        uint newPrice = climb.calculatePrice();

        console.log(
            "endPrice: %s, climbAmount: %s, newPrice: %s",
            endPrice,
            climbAmount,
            newPrice
        );
        console.log("startingPrice: %s", startingPrice);
        uint expectedReturn = (1000 ether * 105) / 100;
        uint calculatedReturn = (climbAmount * endPrice * 95) / (100 ether);
        // negligible difference
        assertGt(1000, expectedReturn - calculatedReturn);
        assertEq(depositAmount, 1000 ether);
        assertEq(climbAmount, currentSupply);
        assertEq(startingPrice, currentPrice);
        assertGt(endPrice, currentPrice);
        assertEq(_stable, address(BUSD));

        assertGt(newPrice, currentPrice);
    }

    function test_deposit_regular() public {
        uint currentPrice = climb.calculatePrice();
        uint currentSupply = climb.totalSupply();

        vm.startPrank(USER_REG);
        mm.deposit(1000 ether, address(USDT));
        vm.stopPrank();

        currentSupply = climb.totalSupply() - currentSupply;
        (
            ,
            uint depositAmount,
            uint climbAmount,
            uint startingPrice,
            uint endPrice,
            address _stable
        ) = mm.users(USER_REG);
        uint newPrice = climb.calculatePrice();

        console.log(
            "endPrice: %s, climbAmount: %s, newPrice: %s",
            endPrice,
            climbAmount,
            newPrice
        );
        console.log("startingPrice: %s", startingPrice);

        assertEq(depositAmount, 1000 ether);
        assertEq(climbAmount, currentSupply);
        assertEq(startingPrice, currentPrice);
        assertGt(endPrice, currentPrice);
        assertEq(_stable, address(USDT));

        assertGt(newPrice, currentPrice);
    }

    function test_cant_deposit_above_max() public {
        vm.expectRevert();
        vm.prank(USER_REG);
        mm.deposit(100_000 ether, address(BUSD));
    }

    function test_cant_redeposit() public {
        vm.startPrank(USER_REG);
        mm.deposit(1000 ether, address(BUSD));
        vm.expectRevert(MoneyMarket__UserAlreadyHasDeposit.selector);
        mm.deposit(1000 ether, address(BUSD));
    }

    function test_force_self_liquidation() public {
        vm.prank(USER_REG);
        mm.deposit(1000 ether, address(BUSD));

        vm.expectRevert(MoneyMarket__UserHasNoProfit.selector);
        vm.startPrank(LIQUIDATOR);
        mm.liquidate(USER_REG, address(BUSD));
        vm.expectRevert(MoneyMarket__UserHasNoProfit.selector);

        address[] memory usersToLiquidate = new address[](1);
        usersToLiquidate[0] = USER_REG;
        mm.liquidateMany(usersToLiquidate, address(BUSD));

        vm.expectRevert(MoneyMarket__UserHasNoProfit.selector);
        vm.prank(USER_REG);
        mm.selfLiquidate(address(BUSD));

        (, , uint currentAmount, , , ) = mm.users(USER_REG);

        vm.expectEmit();
        emit EarlyFeeTaken(USER_REG, currentAmount / 10);
        vm.prank(USER_REG);
        mm.forceSelfLiquidate(address(BUSD));

        (
            ,
            uint depositAmount,
            uint climbAmount,
            uint startingPrice,
            uint endPrice,
            address _stable
        ) = mm.users(USER_REG);

        assertEq(depositAmount, 0);
        assertEq(climbAmount, 0);
        assertEq(startingPrice, 0);
        assertEq(endPrice, 0);
        assertEq(_stable, address(0));
        assertEq(0, climb.balanceOf(address(mm)));
    }

    modifier depositAndProfit() {
        vm.prank(USER_PREF);
        mm.deposit(1000 ether, address(BUSD));
        vm.prank(USER_REG);
        mm.deposit(1000 ether, address(BUSD));

        vm.prank(CLIMB_OWNER);
        climb.setMatrixContract(VOLUME_MAKER, true);
        vm.prank(address(bwm));
        climb.sell(55000 ether, address(BUSD));
        vm.startPrank(VOLUME_MAKER);
        USDT.approve(address(climb), type(uint).max);
        BUSD.approve(address(climb), type(uint).max);

        for (uint i = 0; i < 10; i++) {
            climb.buy(1000 ether, address(BUSD));
            climb.sellAll(address(BUSD));
        }
        vm.stopPrank();

        _;
    }

    function test_self_liquidation_with_profit() public depositAndProfit {
        (uint initIndex, , , , uint endPrice, ) = mm.users(USER_REG);
        uint currentPrice = climb.calculatePrice();
        assertEq(initIndex, 1);

        console.log("endPrice: %s, currentPrice: %s", endPrice, currentPrice);
        assertGt(currentPrice, endPrice);

        vm.expectRevert(MoneyMarket__UserHasProfit.selector);
        vm.startPrank(USER_REG);
        mm.forceSelfLiquidate(address(BUSD));

        vm.expectEmit(true, true, false, false); // do not check topic 02 or data
        emit Liquidate(USER_REG, address(BUSD), 1000 ether);
        mm.selfLiquidate(address(BUSD));

        vm.expectRevert(MoneyMarket__UserHasNoDeposit.selector);
        mm.selfLiquidate(address(BUSD));

        (
            uint endIndex,
            uint depositAmount,
            uint climbAmount,
            uint startingPrice,
            uint _endPrice,
            address _stable
        ) = mm.users(USER_REG);

        assertEq(endIndex, 0);
        assertEq(depositAmount, 0);
        assertEq(climbAmount, 0);
        assertEq(startingPrice, 0);
        assertEq(_endPrice, 0);
        assertEq(_stable, address(0));
        assertEq(mm.getTotalUsers(), 1);
    }

    function test_get_liquidated() public depositAndProfit {
        (uint initIndex, , uint allocatedAmount, , uint endPrice, ) = mm.users(
            USER_REG
        );
        uint currentPrice = climb.calculatePrice();
        uint initBal = BUSD.balanceOf(USER_REG);
        uint expectedReward = (allocatedAmount * endPrice * 95) / 100 ether;
        vm.startPrank(LIQUIDATOR);
        mm.liquidate(USER_REG, address(BUSD));
        vm.expectRevert(MoneyMarket__UserHasNoProfit.selector);
        mm.liquidate(USER_PREF, address(BUSD));

        assertEq(
            BUSD.balanceOf(LIQUIDATOR),
            ((allocatedAmount * currentPrice * 95) / 100 ether) - expectedReward
        );
        // Check if the user got the reward disregarding rounding issues
        assertGt(1000, BUSD.balanceOf(USER_REG) - (initBal + expectedReward));

        (
            ,
            uint depositAmount,
            uint climbAmount,
            uint startingPrice,
            uint _endPrice,
            address _stable
        ) = mm.users(USER_REG);
        assertEq(initIndex, 1);
        assertEq(depositAmount, 0);
        assertEq(climbAmount, 0);
        assertEq(startingPrice, 0);
        assertEq(_endPrice, 0);
        assertEq(_stable, address(0));
        assertEq(mm.getTotalUsers(), 1);

        vm.prank(USER_REG);
        vm.expectRevert(MoneyMarket__UserHasNoDeposit.selector);
        mm.selfLiquidate(address(BUSD));
    }
}
