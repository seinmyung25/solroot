import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("calc-slot", "calc slot value from string(ERC7201)")
  .addParam("string", "ERC7201 string for slot")
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    console.log("0x" + namespaceSlot(hre, args.string));
  });

task("slots", "calc slot value from string(ERC7201)").setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  const namespaces = ["eco.storage.ERC721TypedUpgradeable", "eco.storage.ERC721SequencialMintUpbradeable"];

  namespaces.map((namespace) => console.log(namespaceSlot(hre, namespace), namespace));
});

function namespaceSlot(hre: HardhatRuntimeEnvironment, namespace: string) {
  // keccak256(abi.encode(uint256(keccak256(namespace)) - 1)) & ~bytes32(uint256(0xff))
  const hashNamespace = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(namespace));

  const number = hre.ethers.toBigInt(hashNamespace) - 1n;

  const hash_second = hre.ethers.keccak256(hre.ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [number]));

  const finalMasked = (hre.ethers.toBigInt(hash_second) & (hre.ethers.MaxUint256 - 255n)).toString(16);

  return finalMasked;
}
