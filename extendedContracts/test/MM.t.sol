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
    address BUSD_WHALE = 0xF977814e90dA44bFA03b6295A0616a897441aceC;
    address USDT_WHALE = 0x8894E0a0c962CB723c1976a4421c95949bE2D4E3;

    IERC20 USDT = IERC20(0x55d398326f99059fF775485246999027B3197955);
    IERC20 BUSD = IERC20(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56);

    function setUp() public {
        mm = new MoneyMarket(address(climb), address(bwm));

        vm.startPrank(BUSD_WHALE);
        BUSD.transfer(USER_PREF, 10000 ether);
        BUSD.transfer(USER_REG, 10000 ether);
        vm.startPrank(USDT_WHALE);
        USDT.transfer(USER_PREF, 10000 ether);
        USDT.transfer(USER_REG, 10000 ether);
        vm.stopPrank();
    }

    function test_setup() public {
        assertEq(BUSD.balanceOf(USER_PREF), 10000 ether);
    }
}
