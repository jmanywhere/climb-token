// SPDX-License-Identifier: MIT

pragma solitidy 0.8.20;

import "openzeppelin

/**
 * @title BinanceWealthMatrix Money Market
 * @author Semi Invader
 * @notice This contract is made to give users the power to interact with the BWM Climb Token with expected rewards.
 */
contract MoneyMarket {
  //----------------------
  // Type Definitions
  //----------------------
  struct User{
    uint depositAmount;
    uint climbAmount;
    uint startingPrice;
    uint endPrice;
  }
  //----------------------
  // State Variables
  //----------------------
  mapping(address _user => User info) public users;
  uint public PREFERRED_PROFIT = 5;
  uint public REGULAR_PROFIT = 3;
  uint public PENALTY_FEE = 10;
  uint private p_totalDeposits;
  uint private p_totalWithdrawals;
  uint private constant PERCENTAGE = 100;
  //----------------------

}