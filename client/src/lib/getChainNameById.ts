export const getChainNameById = (chainId: number | undefined) => {
  switch (chainId) {
    case 1:
      return "Ethereum Mainnet";
    case 11155111:
      return "Sepolia";
    case 5:
      return "Goerli";
    case 31337:
      return "Hardhat local Network";
    case 127:
      return "Polygon Mainnet";
    case 80001:
      return "Polygon Mumbai Network";
    case 900:
      return "Curg Test Network";
    default:
      return "Not Connected";
  }
};
