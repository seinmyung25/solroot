import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SolRoot Univ2", function () {
  async function deployERC20() {
    // Contracts are deployed using the first signer/account by default
    const [deployer, ...users] = await ethers.getSigners();

    const WETH = (await ethers.getContractFactory("WETH")).connect(deployer);
    const weth = await WETH.deploy();

    await expect(
      deployer.sendTransaction({ to: weth, value: ethers.parseEther("100") })
    ).not.reverted;
    await expect(weth.deposit({ value: ethers.parseEther("100") })).not
      .reverted;

    expect(await weth.balanceOf(deployer)).equal(ethers.parseEther("100") * 2n);
    expect(await ethers.provider.getBalance(weth)).equal(
      ethers.parseEther("100") * 2n
    );

    const UnivPair = (
      await ethers.getContractFactory("SolRootChildUniswapPair")
    ).connect(deployer);
    const pairImpl = await UnivPair.deploy(
      "SolRoot: Uniswap V2 Pair",
      "SRUV2P"
    );

    const UnivFactory = (
      await ethers.getContractFactory("SolRootUniswapFactory")
    ).connect(deployer);
    const factory = await UnivFactory.deploy(
      deployer,
      "SolRoot: Uniswap V2 Factory",
      "SRUV2F",
      pairImpl,
      deployer
    );

    const Router = (
      await ethers.getContractFactory("UniswapV2Router01")
    ).connect(deployer);
    const router = await Router.deploy(factory, weth);

    const erc20 = (
      await ethers.getContractFactory("ERC20MintableUpgradeable")
    ).connect(deployer);

    return { deployer, weth, factory, router, users, erc20, pairImpl };
  }

  describe("Deployment", function () {
    it("Factory", async function () {
      const { factory } = await loadFixture(deployERC20);

      expect(await factory.name()).to.equal("SolRoot: Uniswap V2 Factory");
      expect(await factory.symbol()).to.equal("SRUV2F");
    });
  });

  describe("Pair", function () {
    it("pair", async function () {
      const { factory, deployer, users, erc20, pairImpl } = await loadFixture(
        deployERC20
      );

      const erc20A = await erc20.deploy("A", "A");
      const erc20B = await erc20.deploy("B", "B");

      const amount = ethers.parseEther("1");

      erc20A.mint(deployer, amount * 1000n);
      erc20B.mint(deployer, amount * 1000n);

      await expect(factory.connect(deployer).createPair(erc20A, erc20B)).not
        .reverted;
      const pair = await ethers.getContractAt(
        "UniswapV2Pair",
        await factory.allPairs(0)
      );

      await erc20A.transfer(pair, amount * 100n);
      await erc20B.transfer(pair, amount * 100n);

      expect(await pair.balanceOf(deployer)).equal(0);
      await expect(pair.mint(deployer)).not.reverted;
      expect(await pair.balanceOf(deployer)).not.equal(0);

      expect(await erc20A.balanceOf(deployer)).equal(
        await erc20B.balanceOf(deployer)
      );
      await erc20A.transfer(pair, amount * 100n);
      await expect(pair.swap(0, amount, deployer, "0x")).not.reverted;
      expect(await erc20A.balanceOf(deployer)).not.equal(
        await erc20B.balanceOf(deployer)
      );
    });
  });

  describe("Router", function () {
    it("router", async function () {
      const { weth, factory, router, deployer, users, erc20, pairImpl } =
        await loadFixture(deployERC20);

      const erc20A = await erc20.deploy("A", "A");
      const erc20B = await erc20.deploy("B", "B");

      const amount = ethers.parseEther("1");

      erc20A.mint(deployer, amount * 1000n);
      erc20A.approve(router, ethers.MaxUint256);
      erc20B.mint(deployer, amount * 1000n);
      erc20B.approve(router, ethers.MaxUint256);

      await expect(
        router.addLiquidityETH(
          erc20A,
          amount * 100n,
          0,
          0,
          deployer,
          (await time.latest()) + 100,
          {
            value: amount * 100n,
          }
        )
      ).not.reverted;

      const pair = await ethers.getContractAt(
        "UniswapV2Pair",
        await factory.allPairs(0)
      );

      await expect(
        router.swapExactTokensForETH(
          amount,
          0,
          [erc20A, weth],
          deployer,
          (await time.latest()) + 100
        )
      ).not.reverted;
    });
  });
});
