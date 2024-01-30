import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("NFT Typed", function () {
  const name = "Typed NFT";
  const symbol = "TNFT";

  async function NFT_Typed_Fixture() {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();

    const NFT = await hre.ethers.getContractFactory("NFT_Typed");
    const nft = await NFT.connect(owner).deploy(name, symbol);
    // await nft.initNFT_Mintable(owner.address, name, symbol); only for proxy

    return { owner, admin, user0, user1, nft };
  }

  describe("Deployment", function () {
    it("Basic Initialize", async function () {
      const { nft, owner } = await loadFixture(NFT_Typed_Fixture);

      await expect(nft.initNFT_Mintable(owner.address, name, symbol)).reverted;

      expect(await nft.owner()).to.equal(owner.address);

      expect(await nft.name()).to.equal(name);
      expect(await nft.symbol()).to.equal(symbol);

      const erc165Factory = await hre.ethers.getContractFactory("ERC165");
      const erc165 = await erc165Factory.deploy();
      expect(await nft.supportsInterface(await erc165.erc721())).equal(true);
    });
  });

  describe("Mint", function () {
    it("Typed mint", async function () {
      const { nft, user0 } = await loadFixture(NFT_Typed_Fixture);

      const baseURIForType = "https://solroot.typed.nft.metadata.io/";

      expect(await nft.tokenURI(0)).equal("");
      await expect(nft.setBaseURI(baseURIForType)).not.reverted;
      await expect(nft.connect(user0).setBaseURI(baseURIForType)).reverted;

      for (let i = 0; i < baseURIForType.length; i++) {
        await expect(nft.setBaseURI("")).reverted;
        await expect(nft.connect(user0).typedMint(user0, i)).reverted;
      }

      for (let i = 0; i < baseURIForType.length; i++) {
        await expect(nft.typedMint(user0, i)).not.reverted;
        expect(await nft.typeSupply(i)).equal(1);
      }

      await expect(nft.setTokenType(1, 0)).reverted;

      expect(await nft.totalSupply()).equal(baseURIForType.length);

      let totalTypedSupply = BigInt(0);

      for (let i = 0; i < baseURIForType.length; i++) {
        expect(await nft.tokenType(i + 1)).equal(i);
        expect(await nft.tokenURI(i + 1)).equal(
          baseURIForType + i.toString() + ".json"
        );
        await expect(nft.connect(user0).setTokenType(i + 1, 0)).reverted;
        const typedSupply = await nft.typeSupply(i);
        expect(typedSupply).not.equal(BigInt(0));
        if (i != 0) await expect(nft.setTokenType(i + 1, 0)).not.reverted;

        totalTypedSupply += typedSupply;
      }
      expect(await nft.totalSupply()).equal(totalTypedSupply);
    });

    it("Next mint & burn", async function () {
      const { nft, user0 } = await loadFixture(NFT_Typed_Fixture);

      const tokenId = await nft.nextMintId();
      expect(await nft.totalSupply()).equal(0);
      expect(await nft.typeSupply(0)).equal(0);

      await expect(nft.nextMint(user0)).not.reverted;
      expect(await nft.totalSupply()).equal(tokenId);
      expect(await nft.typeSupply(0)).equal(tokenId);

      await expect(nft.connect(user0).burn(tokenId)).not.reverted;
      expect(await nft.totalSupply()).equal(0);
      expect(await nft.typeSupply(0)).equal(0);
    });

    it("Batch Mint and type changes", async function () {
      const { nft, user0 } = await loadFixture(NFT_Typed_Fixture);

      await expect(nft.nextMint(user0)).not.reverted;
    });
  });
});
