// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (proxy/beacon/UpgradeableBeacon.sol)

pragma solidity ^0.8.20;

import { IBeacon } from "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface IDiamondBeaconUpgradeable {
    function implementation(bytes4 selector) external view returns (address);
}

/**
 * @dev This contract is used in conjunction with one or more instances of {BeaconProxy} to determine their
 * implementation contract, which is where they will delegate all function calls.
 *
 * An owner is able to change the implementation the beacon points to, thus upgrading the proxies that use this beacon.
 */
abstract contract DiamondBeaconUpgradeable is IDiamondBeaconUpgradeable, OwnableUpgradeable {
    /// @custom:storage-location erc7201:solroot.storage.diamond.beacon
    struct DiamondBeaconStorage {
        mapping(bytes4 => address) implementations;
    }

    // keccak256(abi.encode(uint256(keccak256("solroot.storage.diamond.beacon")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant DiamondBeaconStorageLocation = 0xf952b68eb7b8204e3646fa3087f9877c2187132fc04d5c3d2533224865755200;

    function _getDiamondBeaconStorage() private pure returns (DiamondBeaconStorage storage $) {
        assembly {
            $.slot := DiamondBeaconStorageLocation
        }
    }

    function setDiamondImplementation(bytes4[] memory selectors, address impl) onlyOwner public {
        DiamondBeaconStorage storage $ = _getDiamondBeaconStorage();
        for(uint256 i; i<selectors.length; i++) {
            $.implementations[selectors[i]] = impl;
        }
    }

    function implementation(bytes4 selector) public view override returns (address) {
        return _getDiamondBeaconStorage().implementations[selector];
    }
}

import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract DiamondBeaconProxy is BeaconProxy {
    constructor(bytes memory initData) payable
    BeaconProxy(msg.sender, initData)
    {}

    function _implementation() internal view virtual override returns (address) {
        return IDiamondBeaconUpgradeable(_getBeacon()).implementation(msg.sig);
    }
}
