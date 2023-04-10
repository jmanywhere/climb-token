import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      hardfork: "london",
      chainId: 56,
      forking:{
        url: "https://bscrpc.com",
        blockNumber: 26976870
      },
    },
  },
};

export default config