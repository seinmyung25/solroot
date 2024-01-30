import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SolRoot1155", function () {
  const pName = "SolRootParent1155";
  const pSymbol = "SRP1155";

  const cName = "SolRootChild1155";
  const cSymbol = "SRC1155";

  async function fixtureSR1155() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, ...users] = await ethers.getSigners();

    const SRC1155 = await ethers.getContractFactory("SolRootChildERC1155");
    const src1155 = await SRC1155.deploy(cName, cSymbol);

    const SRP1155 = await ethers.getContractFactory(
      "DiamondSolRootERC1155Parent"
    );
    const srp1155 = await SRP1155.connect(deployer).deploy(
      deployer,
      pName,
      pSymbol,
      src1155
    );

    // srp1155.setImplementation()

    return { SRC1155, src1155, SRP1155, srp1155, deployer, users };
  }

  describe("Deployment", function () {
    it("deploy", async function () {
      const { src1155, srp1155, deployer, users } = await loadFixture(
        fixtureSR1155
      );

      expect(await srp1155.name()).to.equal(pName);
      expect(await srp1155.symbol()).to.equal(pSymbol);

      expect(await src1155.name()).to.equal(cName);
      expect(await src1155.symbol()).to.equal(cSymbol);
    });
  });
});
