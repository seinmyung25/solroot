import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { AsyncConstructor } from "async-constructor";
import { expect } from "chai";
import { ContractFactory } from "ethers";
import hre from "hardhat";

import { ERC20MintableUpgradeable } from "../typechain-types";

import { getSelector } from "./helper";

type ProxiedContract<FT extends ContractFactory> = Awaited<
  ReturnType<FT["deploy"]>
>;

class ProxyContractTypeTest<
  FT extends ContractFactory
> extends AsyncConstructor {
  logicFactory!: FT;
  logic!: ProxiedContract<FT>; // FT의 deploy 메서드 반환 타입으로 정의

  constructor(logicFactory: FT, ...args: unknown[]) {
    super(async () => {
      this.logicFactory = logicFactory;
      this.logic = (await this.logicFactory.deploy(
        ...args
      )) as ProxiedContract<FT>;
    });
  }
}

describe("ProxyContractTypeTest", function () {
  const name = "Mintable Token";
  const symbol = "M ERC20";

  async function Proxy_Helper_Fixture() {
    const [owner] = await hre.ethers.getSigners();
    const helper = await new ProxyContractTypeTest(
      await hre.ethers.getContractFactory("ERC20MintableUpgradeable"),
      name,
      symbol
    );
    return { owner, helper };
  }

  it("testing proxy", async function () {
    const { helper } = await loadFixture(Proxy_Helper_Fixture);
    expect(await helper.logic.symbol()).equal(symbol);
  });
});

describe("ERC20 Mintable", function () {
  const name = "Mintable Token";
  const symbol = "M ERC20";

  const amount = hre.ethers.parseEther("100");
  async function NFT_Mintable_Fixture() {
    // TODO: apply proxyFactory
    const [owner, ...users] = await hre.ethers.getSigners();

    const SolrootProxyAdmin = await hre.ethers.getContractFactory(
      "SolrootProxyAdmin"
    );
    const admin = await SolrootProxyAdmin.deploy(owner);

    const ProxyForProxyAdmin = await hre.ethers.getContractFactory(
      "ProxyForProxyAdmin"
    );
    const pAdmin = await ProxyForProxyAdmin.deploy(admin, owner);

    const ERC20 = await hre.ethers.getContractFactory(
      "ERC20MintableUpgradeable"
    );
    const erc20 = await ERC20.deploy(name, symbol);

    const TProxyWithAdmin = await hre.ethers.getContractFactory(
      "TProxyWithAdmin"
    );
    const inst = await TProxyWithAdmin.deploy(
      pAdmin,
      erc20,
      erc20.interface.encodeFunctionData("initSolrootERC20Mintable", [
        owner.address,
        name,
        symbol,
      ])
    );
    const pErc20: ERC20MintableUpgradeable = erc20.attach(
      await inst.getAddress()
    ) as ERC20MintableUpgradeable;

    return { owner, users, admin, pAdmin, erc20, pErc20 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { pErc20, owner } = await loadFixture(NFT_Mintable_Fixture);

      expect(await pErc20.owner()).to.equal(owner.address);
    });

    it("Should set the right metadata", async function () {
      const { pErc20 } = await loadFixture(NFT_Mintable_Fixture);

      expect(await pErc20.name()).to.equal(name);
      expect(await pErc20.symbol()).to.equal(symbol);
    });
  });

  describe("Non Fungible Token", function () {
    describe("Mint", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { pErc20, users } = await loadFixture(NFT_Mintable_Fixture);
        const user_connected_nft = pErc20.connect(users[0]);
        await expect(user_connected_nft.mint(users[0], amount)).reverted;
      });

      it("Shouldn't fail mint with the right owner", async function () {
        const { pErc20, users } = await loadFixture(NFT_Mintable_Fixture);
        await expect(pErc20.mint(users[0], amount)).not.reverted;
      });

      it("Shouldn't fail mint with the right role access account", async function () {
        const { pErc20, users } = await loadFixture(NFT_Mintable_Fixture);

        await expect(
          pErc20.grantSelectorRole(getSelector(pErc20.mint), users[0])
        ).not.reverted;

        const user_connected_nft = pErc20.connect(users[0]);
        await expect(user_connected_nft.mint(users[0], amount)).not.reverted;

        await expect(
          pErc20.revokeSelectorRole(getSelector(pErc20.mint), users[0])
        ).not.reverted;
        await expect(user_connected_nft.mint(users[0], amount)).reverted;
      });
    });

    describe("Transfer", function () {
      it("Should revert with the right error if mint called from another account", async function () {
        const { owner, pErc20, users } = await loadFixture(
          NFT_Mintable_Fixture
        );
        await expect(pErc20.mint(users[0], amount)).not.reverted;

        await pErc20.connect(users[0]).approve(owner, hre.ethers.MaxUint256);
        await expect(
          pErc20.transferFrom(
            users[0],
            users[1],
            await pErc20.balanceOf(users[0])
          )
        ).not.reverted;
        await expect(pErc20.transferFrom(users[0], users[1], amount)).reverted;
        await expect(
          pErc20
            .connect(users[1])
            .transferFrom(users[1], users[0], await pErc20.balanceOf(users[1]))
        ).reverted;
        await pErc20.connect(users[1]).approve(owner, hre.ethers.MaxUint256);
        await expect(
          pErc20.transferFrom(
            users[1],
            users[0],
            await pErc20.balanceOf(users[1])
          )
        ).not.reverted;
      });
    });
  });
});
