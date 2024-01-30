import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../../helper";

describe("SBT", function () {
  const name = "Mintable SBT";
  const symbol = "MSBT";

  async function SBT_Mintable_Fixture() {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();

    const SBT = await hre.ethers.getContractFactory("SBT");
    const sbt = await SBT.connect(owner).deploy(name, symbol);
    // await sbt.initSBT_Mintable(owner.address, name, symbol); only for proxy

    return { owner, admin, user0, user1, sbt };
  }

  describe("SBT Action", function () {
    it("Support Interface", async function () {
      const { sbt } = await loadFixture(SBT_Mintable_Fixture);

      const erc165Factory = await hre.ethers.getContractFactory("ERC165");
      const erc165 = await erc165Factory.deploy();
      expect(await sbt.supportsInterface(await erc165.erc721())).equal(true);
    });

    it("Mint & Transfer &Burn", async function () {
      const { sbt, user0, user1 } = await loadFixture(SBT_Mintable_Fixture);

      const tokenId = await sbt.nextMintId();

      await expect(sbt.nextMint(user0)).not.reverted;

      await expect(sbt.connect(user0).transferFrom(user0, user1, tokenId)).reverted;

      await expect(sbt.connect(user0).burn(tokenId)).not.reverted;
    });
  });
});
