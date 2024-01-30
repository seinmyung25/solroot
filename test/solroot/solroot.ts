import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SolRoot", function () {
  async function solrootPack() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, ...users] = await ethers.getSigners();

    const ERC20MintableUpgradeable = await ethers.getContractFactory(
      "ERC20MintableUpgradeable"
    );
    const erc20 = await ERC20MintableUpgradeable.connect(deployer).deploy(
      "Test",
      "TST"
    );

    return { erc20, deployer, users };
  }

  describe("Deployment", function () {
    it("deploy", async function () {
      const { erc20 } = await loadFixture(solrootPack);

      expect(await erc20.name()).to.equal("Test");
      expect(await erc20.symbol()).to.equal("TST");
      expect(await erc20.decimals()).to.equal(18);
    });
  });

  describe("Mint", function () {
    it("minting", async function () {
      const { erc20, deployer, users } = await loadFixture(solrootPack);

      await expect(
        erc20.connect(deployer).mint(users[0], ethers.parseEther("1"))
      )
        .emit(erc20, "Transfer")
        .withArgs(ethers.ZeroAddress, users[0].address, ethers.parseEther("1"));
    });
  });
});
