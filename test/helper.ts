import hre from "hardhat";

export function getSelector(contractMethod: {
  fragment: { selector: string };
}): string {
  return contractMethod.fragment.selector;
}

export function getSelector32(contractMethod: {
  fragment: { selector: string };
}): string {
  return hre.ethers.zeroPadBytes(contractMethod.fragment.selector, 32);
}

export interface HardhatContract {
  getAddress(): Promise<string>;
}

const IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const ADMIN_SLOT =
  "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";

export async function getImplAddress(logic: HardhatContract) {
  const slotData = await hre.ethers.provider.getStorage(
    logic,
    IMPLEMENTATION_SLOT
  );
  return hre.ethers.getAddress("0x" + slotData.slice(-40));
}

export async function getAdminAddress(logic: HardhatContract) {
  const slotData = await hre.ethers.provider.getStorage(logic, ADMIN_SLOT);
  return hre.ethers.getAddress("0x" + slotData.slice(-40));
}
