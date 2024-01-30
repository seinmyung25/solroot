import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";

import { SolRootChildERC20 } from "../../typechain-types";
import { expect } from "chai";
import { FunctionFragment } from "ethers";

describe("Diamond", function () {
  const childName = "SolRoot Diamond ERC20 Child";
  const childSymbol = "SRDC20";
  async function fixtureDiamondBeacon() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, ...otherAccounts] = await hre.ethers.getSigners();

    const logicFactory = await hre.ethers.getContractFactory(
      "SolRootChildERC20"
    );
    const childLogic = await logicFactory.deploy(childName, childSymbol);

    const BeaconFactory = await hre.ethers.getContractFactory(
      "DiamondSolRootERC1155Parent"
    );
    const beacon = await BeaconFactory.deploy(deployer, "BB", "BB", childLogic);

    const selectors: string[] = childLogic.interface.fragments
      .map((fragment) => (fragment as FunctionFragment).selector)
      .filter((selector) => selector !== undefined);
    await expect(beacon.setDiamondImplementation(selectors, childLogic)).not
      .reverted;

    return { beacon, childLogic, deployer, otherAccounts };
  }

  describe("Deployment", function () {
    it("deploy", async function () {
      const { beacon, childLogic, deployer, otherAccounts } = await loadFixture(
        fixtureDiamondBeacon
      );
      const childInstanceName = childName + " Instance";
      const childInstanceSymbol = childSymbol + "I";
      const initData = childLogic.interface.encodeFunctionData(
        "initSolRootChild",
        [childInstanceName, childInstanceSymbol]
      );
      const tx = await beacon.deploy(initData);
      const receipt = await tx.wait();
      const logs = receipt!.logs;

      let childAddress: string;
      for (const log of logs) {
        // 인터페이스를 사용하여 로그를 디코드
        try {
          const event = beacon.interface.parseLog(log);
          if (event.name === "BeaconProxyCreated") {
            childAddress = event?.args[0];
            break;
          }
        } catch (error) {
          // 로그가 이 컨트랙트의 이벤트가 아닐 수 있으므로, 에러 처리
        }
      }
      console.log("beacon child address:", childAddress!);
      const child = childLogic.attach(childAddress!) as SolRootChildERC20;

      await expect(child.connect(otherAccounts[0]).mint(deployer, 100))
        .reverted;
      await expect(child.mint(deployer, 100)).not.reverted;

      expect(await child.name()).equal(childInstanceName);
      expect(await child.symbol()).equal(childInstanceSymbol);
    });
  });
});
