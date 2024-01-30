// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (proxy/transparent/ProxyAdmin.sol)

pragma solidity ^0.8.20;

import { ITransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { IOwnable, Ownable } from "../access/Ownable.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

interface IProxyAdmin {
    function initProxyAdmin(address initialOwner) external;
}

/**
 * @dev This is an auxiliary contract meant to be assigned as the admin of a {TransparentUpgradeableProxy}. For an
 * explanation of why you would want to use this see the documentation for {TransparentUpgradeableProxy}.
 */
contract SolrootProxyAdmin is IProxyAdmin, Ownable {
    /**
     * @dev The version of the upgrade interface of the contract. If this getter is missing, both `upgrade(address)`
     * and `upgradeAndCall(address,bytes)` are present, and `upgradeTo` must be used if no function should be called,
     * while `upgradeAndCall` will invoke the `receive` function if the second argument is the empty byte string.
     * If the getter returns `"5.0.0"`, only `upgradeAndCall(address,bytes)` is present, and the second argument must
     * be the empty byte string if no function should be called, making it impossible to invoke the `receive` function
     * during an upgrade.
     */
    string public constant UPGRADE_INTERFACE_VERSION = "5.0.0";

    /**
     * @dev Sets the initial owner who can perform upgrades.
     */
    constructor(address initialOwner) {
        initProxyAdmin(initialOwner);
    }

    function initProxyAdmin(address initialOwner) public override initializer {
        initOwnable(initialOwner);
    }

    /**
     * @dev Upgrades `proxy` to `implementation` and calls a function on the new implementation.
     * See {TransparentUpgradeableProxy-_dispatchUpgradeToAndCall}.
     *
     * Requirements:
     *
     * - This contract must be the admin of `proxy`.
     * - If `data` is empty, `msg.value` must be zero.
     */
    function upgradeAndCall(
        ITransparentUpgradeableProxy proxy,
        address implementation,
        bytes memory data
    ) public payable virtual onlyOwner {
        proxy.upgradeToAndCall{ value: msg.value }(implementation, data);
    }
}

contract ProxyForProxyAdmin is ERC1967Proxy {
    constructor(
        address proxyAdminLogic,
        address initialOwner
    ) ERC1967Proxy(proxyAdminLogic, abi.encodeWithSelector(IProxyAdmin.initProxyAdmin.selector, initialOwner)) {}
}

contract TestProxyAdminFail is SolrootProxyAdmin {
    constructor() SolrootProxyAdmin(_msgSender()) {}

    function command(address to, uint256 value, bytes memory data) public payable returns (bytes memory) {
        bool success;
        (success, data) = to.call{ value: value }(data);
        require(success, "call fail");
        return data;
    }
}
