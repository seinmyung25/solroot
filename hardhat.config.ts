import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/utils";
import "./tasks/namespace-slot";

const config: HardhatUserConfig = {
  solidity: "0.8.22",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
  },
};

export default config;
