import { InjectedConnector } from "@web3-react/injected-connector";

export const injected = new InjectedConnector({
  supportedChainIds: [
    1, // Ethereum Mainnet
    5, // Goerli Testnet
    11155111, // Sepolia Testnet,
    127, // Polygon Mainnet
    80001, // Polygon Mumbai Network
    31337, // Hardhat local Network
    900, // Curg Test Network
  ],
});
