// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (proxy/beacon/UpgradeableBeacon.sol)

pragma solidity ^0.8.20;

import { IBeacon } from "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @dev This contract is used in conjunction with one or more instances of {BeaconProxy} to determine their
 * implementation contract, which is where they will delegate all function calls.
 *
 * An owner is able to change the implementation the beacon points to, thus upgrading the proxies that use this beacon.
 */
abstract contract BeaconUpgradeable is IBeacon, OwnableUpgradeable {
    /// @custom:storage-location erc7201:solroot.storage.beacon
    struct BeaconStorage {
        address implementation;
    }

    // keccak256(abi.encode(uint256(keccak256("solroot.storage.beacon")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant BeaconStorageLocation = 0x9173b5f1e33f7955d1373e5a3b2c5b344edfb3ff22505338c505d1ded4f6cb00;

    function _getBeaconStorage() private pure returns (BeaconStorage storage $) {
        assembly {
            $.slot := BeaconStorageLocation
        }
    }

    /**
     * @dev The `implementation` of the beacon is invalid.
     */
    error BeaconInvalidImplementation(address implementation);

    /**
     * @dev Emitted when the implementation returned by the beacon is changed.
     */
    event Upgraded(address indexed implementation);

    function __BeaconUpgradeable_init(address _implementation) internal onlyInitializing {
        _setImplementation(_implementation);
    }

    /**
     * @dev Returns the current implementation address.
     */
    function implementation() public view virtual returns (address) {
        return _getBeaconStorage().implementation;
    }

    /**
     * @dev Upgrades the beacon to a new implementation.
     *
     * Emits an {Upgraded} event.
     *
     * Requirements:
     *
     * - msg.sender must be the owner of the contract.
     * - `newImplementation` must be a contract.
     */
    function upgradeTo(address newImplementation) public virtual onlyOwner {
        _setImplementation(newImplementation);
    }

    /**
     * @dev Sets the implementation contract address for this beacon
     *
     * Requirements:
     *
     * - `newImplementation` must be a contract.
     */
    function _setImplementation(address newImplementation) private {
        if (newImplementation.code.length == 0) {
            revert BeaconInvalidImplementation(newImplementation);
        }
        _getBeaconStorage().implementation = newImplementation;
        emit Upgraded(newImplementation);
    }
}
