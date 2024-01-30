import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getSelector } from "../../helper";

describe("NFT Mintable", function () {
  const name = "Mintable NFT";
  const symbol = "MNFT";

  async function NFT_Mintable_Fixture() {
    const [owner, admin, user0, user1] = await hre.ethers.getSigners();

    const NFT = await hre.ethers.getContractFactory("NFT_Mintable");
    const nft = await NFT.connect(owner).deploy(name, symbol);
    // await nft.initNFT_Mintable(owner.address, name, symbol); only for proxy

    return { owner, admin, user0, user1, nft };
  }

  describe("Deployment", function () {
    it("Basic Initialize", async function () {
      const { nft, owner } = await loadFixture(NFT_Mintable_Fixture);

      await expect(nft.initNFT_Mintable(owner.address, name, symbol)).reverted;

      expect(await nft.owner()).to.equal(owner.address);

      expect(await nft.name()).to.equal(name);
      expect(await nft.symbol()).to.equal(symbol);

      const erc165Factory = await hre.ethers.getContractFactory("ERC165");
      const erc165 = await erc165Factory.deploy();
      expect(await nft.supportsInterface(await erc165.erc721())).equal(true);
    });
  });

  describe("Mintable NFT", function () {
    it("owner mint", async function () {
      const { nft, user0 } = await loadFixture(NFT_Mintable_Fixture);

      await expect(nft.nextMint(user0)).not.reverted;
      await expect(nft.connect(user0).nextMint(user0)).reverted;
    });

    it("admin mint", async function () {
      const { nft, admin, user0 } = await loadFixture(NFT_Mintable_Fixture);

      await expect(nft.connect(user0).nextMint(user0)).reverted;
      await expect(nft.connect(admin).nextMint(user0)).reverted;

      await expect(nft.grantSelectorRole(getSelector(nft.nextMint), admin)).not.reverted;
      await expect(nft.connect(user0).nextMint(user0)).reverted;

      const tokenId = await nft.nextMintId();
      await expect(nft.connect(admin).nextMint(user0))
        .emit(nft, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, user0, tokenId);

      await expect(nft.revokeSelectorRole(getSelector(nft.nextMint), admin)).not.reverted;
      await expect(nft.connect(user0).nextMint(user0)).reverted;
      await expect(nft.connect(admin).nextMint(user0)).reverted;
    });

    it("admin mint batch", async function () {
      const { nft, admin, user0 } = await loadFixture(NFT_Mintable_Fixture);

      const batchAmount = 10;

      await expect(nft.connect(user0).nextMintBatch(user0, batchAmount)).reverted;
      await expect(nft.connect(admin).nextMintBatch(user0, batchAmount)).reverted;

      await expect(nft.grantSelectorRole(getSelector(nft.nextMintBatch), admin)).not.reverted;
      await expect(nft.connect(user0).nextMintBatch(user0, batchAmount)).reverted;

      const startTokenId = await nft.nextMintId();
      const tokenIds = Array.from({ length: batchAmount }, (_, i) => startTokenId + BigInt(i));


      expect(await nft.totalSupply()).equal(0);
      expect(await nft.balanceOf(user0)).equal(0);
      await expect(nft.connect(admin).nextMintBatch(user0, batchAmount)).not.reverted;
      expect(await nft.totalSupply()).equal(BigInt(tokenIds.length));
      expect(await nft.balanceOf(user0)).equal(BigInt(tokenIds.length));

      for(let i=0; i<tokenIds.length; i++) {
        expect(await nft.tokenOfOwnerByIndex(user0, i)).equal(tokenIds[i]);
      }

      await expect(nft.revokeSelectorRole(getSelector(nft.nextMintBatch), admin)).not.reverted;
      await expect(nft.connect(user0).nextMintBatch(user0, batchAmount)).reverted;
      await expect(nft.connect(admin).nextMintBatch(user0, batchAmount)).reverted;
    });

    describe("Transfer", function () {
      it("transfer and approve test", async function () {
        const { nft, user0, user1 } = await loadFixture(NFT_Mintable_Fixture);
        await expect(nft.nextMint(user0)).not.reverted;

        await expect(nft.connect(user1).transferFrom(user0, user1, await nft.tokenOfOwnerByIndex(user0, 0))).reverted;
        await expect(nft.connect(user0).transferFrom(user0, user1, await nft.tokenOfOwnerByIndex(user0, 0))).not
          .reverted;
        await expect(nft.connect(user0).transferFrom(user1, user0, await nft.tokenOfOwnerByIndex(user1, 0))).reverted;

        await expect(nft.connect(user1).approve(user0, await nft.tokenOfOwnerByIndex(user1, 0))).not.reverted;
        await expect(nft.connect(user0).transferFrom(user1, user0, await nft.tokenOfOwnerByIndex(user1, 0))).not
          .reverted;

        await expect(nft.nextMint(user0)).not.reverted;
        await expect(nft.nextMint(user0)).not.reverted;
        await expect(nft.nextMint(user0)).not.reverted;

        await expect(nft.connect(user1).transferFrom(user0, user1, await nft.tokenOfOwnerByIndex(user0, 0))).reverted;

        await expect(nft.connect(user0).setApprovalForAll(user1, true)).not.reverted;
        for (let i = 1; i < (await nft.balanceOf(user0)); i++) {
          await expect(nft.connect(user1).transferFrom(user0, user1, i)).not.reverted;
        }
      });

      it("transfer and approve test", async function () {
        const { nft, user0, user1 } = await loadFixture(NFT_Mintable_Fixture);

        const tokenId = await nft.nextMintId();
        await expect(nft.nextMint(user0)).not.reverted;
        await expect(nft.pause()).not.reverted;

        await expect(nft.connect(user0).transferFrom(user0, user1, tokenId)).reverted;
      });

      it("Queryable!", async function () {
        const { nft, user0, user1 } = await loadFixture(NFT_Mintable_Fixture);

        const len = 10;

        const tokenIds = Array(len);

        for (let i = 0; i < 10; i++) {
          tokenIds[i] = await nft.nextMintId();
          await expect(nft.nextMint(user0)).not.reverted;
        }

        expect(await nft.tokensOfOwner(user0)).deep.equal(tokenIds);
        expect(await nft.tokensOfOwnerIn(user0, 1, len + 1)).deep.equal(tokenIds);

        expect(await nft.tokensOfOwnerIn(user0, 1, len + 2)).deep.equal(tokenIds);

        await expect(nft.tokensOfOwnerIn(user0, len + 1, 1)).reverted;

        expect(await nft.tokensOfOwnerIn(user1, 1, len + 1)).deep.equal([]);
      });
    });
  });
});
