import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/utils";
import "./tasks/namespace-slot";

const config: HardhatUserConfig = {
  solidity: "0.8.22",
};

export default config;
