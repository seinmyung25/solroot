import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

import { getAdminAddress, getImplAddress } from "../helper";

describe("Proxy Test", function () {
  const name = "Mintable Token";
  const symbol = "M ERC20";

  async function fixtureProxyConfig() {
    const [owner, ...users] = await hre.ethers.getSigners();

    const ERC20 = await hre.ethers.getContractFactory(
      "ERC20MintableUpgradeable"
    );
    const erc20Logic = await ERC20.deploy(name, symbol);

    const SolrootProxyAdmin = await hre.ethers.getContractFactory(
      "SolrootProxyAdmin"
    );
    const proxyAdminLogic = await SolrootProxyAdmin.deploy(owner);

    const initData = erc20Logic.interface.encodeFunctionData(
      "initSolrootERC20Mintable",
      [owner.address, name, symbol]
    );

    const TProxyWithAdminLogic = await hre.ethers.getContractFactory(
      "TProxyWithAdminLogic"
    );
    const proxy = await TProxyWithAdminLogic.deploy(
      proxyAdminLogic,
      erc20Logic,
      initData
    );

    const proxyAdmin = await hre.ethers.getContractAt(
      "SolrootProxyAdmin",
      await getAdminAddress(proxy),
      owner
    );
    const inst = await hre.ethers.getContractAt(
      "ERC20MintableUpgradeable",
      proxy.target,
      owner
    );

    return {
      erc20Logic,
      proxyAdminLogic,
      proxyAdmin,
      proxy,
      inst,
      owner,
      users,
      TProxyWithAdminLogic,
    };
  }

  describe("Deployment", function () {
    it("SolrootProxyAdmin check", async function () {
      const { proxyAdminLogic, owner } = await loadFixture(fixtureProxyConfig);

      expect(await proxyAdminLogic.owner()).equal(owner);
      await expect(proxyAdminLogic.initProxyAdmin(owner)).reverted;
    });

    it("Proxy check", async function () {
      const { erc20Logic, proxyAdmin, proxy } = await loadFixture(
        fixtureProxyConfig
      );

      expect(await getAdminAddress(proxy)).equal(proxyAdmin);
      expect(await getImplAddress(proxy)).equal(erc20Logic);
    });

    it("Inst check", async function () {
      const { inst } = await loadFixture(fixtureProxyConfig);

      expect(await inst.name()).equal(name);
      expect(await inst.symbol()).equal(symbol);
    });

    it("upgrade check", async function () {
      const { erc20Logic, proxyAdmin, proxy, inst, users } = await loadFixture(
        fixtureProxyConfig
      );

      const theDecimals = 6;
      const ERC20Decimal = await hre.ethers.getContractFactory(
        "ERC20MintableUpgradeableWithDecimal"
      );
      const erc20DecimalLogic = await ERC20Decimal.deploy(
        name,
        symbol,
        theDecimals
      );

      expect(await erc20Logic.decimals()).equal(18);
      expect(await inst.decimals()).equal(18);
      expect(await erc20DecimalLogic.decimals()).equal(theDecimals);

      await expect(
        proxyAdmin
          .connect(users[0])
          .upgradeAndCall(proxy, erc20DecimalLogic, "0x")
      ).rejected;
      await expect(proxyAdmin.upgradeAndCall(proxy, erc20DecimalLogic, "0x"))
        .not.reverted;

      expect(await inst.decimals()).equal(theDecimals);
      expect(await inst.name()).equal(name);
      expect(await inst.symbol()).equal(symbol);
    });

    it("Proxy Admin call Proxy fail check", async function () {
      const { erc20Logic, TProxyWithAdminLogic, owner, users } =
        await loadFixture(fixtureProxyConfig);

      const TestProxyAdminFail = await hre.ethers.getContractFactory(
        "TestProxyAdminFail"
      );
      const testProxyAdminLogic = await TestProxyAdminFail.deploy();

      const initData = erc20Logic.interface.encodeFunctionData(
        "initSolrootERC20Mintable",
        [owner.address, name, symbol]
      );
      const proxy = await TProxyWithAdminLogic.deploy(
        testProxyAdminLogic,
        erc20Logic,
        initData
      );

      const proxyAdmin = await hre.ethers.getContractAt(
        "TestProxyAdminFail",
        await getAdminAddress(proxy),
        owner
      );

      const failInput = erc20Logic.interface.encodeFunctionData("name");

      await expect(proxyAdmin.command(proxy, 0, failInput)).reverted;

      const artifact = await hre.artifacts.readArtifact(
        "ITransparentUpgradeableProxy"
      );
      const proxyInterface = new hre.ethers.Interface(artifact.abi);
      const successInput = proxyInterface.encodeFunctionData(
        "upgradeToAndCall",
        [await erc20Logic.getAddress(), "0x"]
      );

      // await expect(proxyAdmin.connect(users[0]).command(proxy, 0, successInput)).not.reverted;
      await expect(proxyAdmin.command(proxy, 0, successInput)).not.reverted;
    });
  });
});
