// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { IOwnable, Ownable } from "./Ownable.sol";
import { AccessControlEnumerableUpgradeable, AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import { IAccessControlEnumerable, IAccessControl } from "@openzeppelin/contracts/access/extensions/IAccessControlEnumerable.sol";

interface IPausable {
    // function paused() external view returns (bool); already defined & implemented

    function pause() external;

    function unpause() external;
}

interface IMulticall {
    function multicall(bytes[] calldata data) external returns (bytes[] memory results);
}

interface ISelectorRoleControl is IAccessControlEnumerable, IPausable {
    function grantSelectorRole(bytes4 selector, address account) external;

    function revokeSelectorRole(bytes4 selector, address account) external;

    function pause() external;

    function unpause() external;
}

contract SelectorRoleControlUpgradeable is
    Initializable,
    ISelectorRoleControl,
    Ownable,
    PausableUpgradeable,
    AccessControlEnumerableUpgradeable
{
    modifier onlyAdmin() {
        _onlyAdmin(_msgSender());
        _;
    }

    function _onlyAdmin(address account) internal view {
        if (owner() != account) _checkRole(msg.sig, account);
    }

    function grantSelectorRole(bytes4 selector, address account) public virtual override onlyAdmin {
        require(_grantRole(selector, account), "role exist");
    }

    function revokeSelectorRole(bytes4 selector, address account) public virtual override onlyAdmin {
        require(_revokeRole(selector, account), "role not exist");
    }

    function paused() public view virtual override returns (bool) {
        return super.paused();
    }

    // IPausable
    function pause() public virtual override onlyAdmin {
        _pause();
    }

    function unpause() public virtual override onlyAdmin {
        _unpause();
    }
}
