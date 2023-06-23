const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_climb",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_bwm",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "deposited",
        "type": "uint256"
      }
    ],
    "name": "MoneyMarket__InvalidDepositAmount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_preferred",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_regular",
        "type": "uint256"
      }
    ],
    "name": "MoneyMarket__InvalidProfitThresholds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MoneyMarket__InvalidStableAddress",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxLimit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amountToIncreaseTo",
        "type": "uint256"
      }
    ],
    "name": "MoneyMarket__MaxClimbAmountReached",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MoneyMarket__UserAlreadyHasDeposit",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MoneyMarket__UserHasNoDeposit",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MoneyMarket__UserHasNoProfit",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MoneyMarket__UserHasProfit",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "_stableAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_Profit",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_stableAmount",
        "type": "uint256"
      }
    ],
    "name": "Deposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_feeAmountInClimb",
        "type": "uint256"
      }
    ],
    "name": "EarlyFeeTaken",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_penalty",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_burn",
        "type": "uint256"
      }
    ],
    "name": "EditFees",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_newDepositMin",
        "type": "uint256"
      }
    ],
    "name": "EditMinDeposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_preferred",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_regular",
        "type": "uint256"
      }
    ],
    "name": "EditProfits",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_newThreshold",
        "type": "uint256"
      }
    ],
    "name": "EditThreshold",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_liquidatedUser",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "_stableLiquidated",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_liquidatedAmount",
        "type": "uint256"
      }
    ],
    "name": "Liquidate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "_liquidator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "_rewardAmount",
        "type": "uint256"
      }
    ],
    "name": "LiquidatorReward",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BURN_FEE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_CLIMB_IN_MARKET",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_DEPOSIT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PENALTY_FEE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PREFERRED_PROFIT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REGULAR_PROFIT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "bwm",
    "outputs": [
      {
        "internalType": "contract IBinanceWealthMatrix",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "climb",
    "outputs": [
      {
        "internalType": "contract IClimb",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_stableAmount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_stableAddress",
        "type": "address"
      }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newPenalty",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_newBurn",
        "type": "uint256"
      }
    ],
    "name": "editFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newThreshold",
        "type": "uint256"
      }
    ],
    "name": "editMaxThreshold",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newMinDepositAmount",
        "type": "uint256"
      }
    ],
    "name": "editMinDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newPreferred",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_newReg",
        "type": "uint256"
      }
    ],
    "name": "editProfitThresholds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_preferredStable",
        "type": "address"
      }
    ],
    "name": "forceSelfLiquidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "liquidableUsers",
        "type": "address[]"
      }
    ],
    "name": "getAvailableLiquidationFromUsers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalUsers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getUsersAvailForLiquidation",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_userToLiquidate",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_stable",
        "type": "address"
      }
    ],
    "name": "liquidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "_users",
        "type": "address[]"
      },
      {
        "internalType": "address",
        "name": "_stable",
        "type": "address"
      }
    ],
    "name": "liquidateMany",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minForPreferred",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_preferredStable",
        "type": "address"
      }
    ],
    "name": "selfLiquidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDeposits",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalWithdrawals",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "participationIndex",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "depositAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "climbAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "startingPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endPrice",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "preferredToken",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export default abi;