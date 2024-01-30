// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { Ownable2StepUpgradeable } from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

interface IOwnable {
    function owner() external view returns (address);
    function renounceOwnership() external ;
    function transferOwnership(address newOwner) external ;
}

interface IOwnable2Step is IOwnable {
    function pendingOwner() external view returns (address);
    function acceptOwnership() external ;
}

interface IOwnableFull is IOwnable2Step {
    function initOwnable(address initialOwner) external ;

    function registerPendingOwner(address pendingOwner) external ;
}

abstract contract Ownable is
    IOwnableFull,
    Initializable,
    Ownable2StepUpgradeable
{
    function initOwnable(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
    }

    function owner() public view virtual
    override(IOwnable, OwnableUpgradeable) returns (address) {
        return super.owner();
    }

    function renounceOwnership() public virtual
    override(IOwnable, OwnableUpgradeable) {
        return super.renounceOwnership();
    }

    function transferOwnership(address newOwner) public virtual
    override(IOwnable, Ownable2StepUpgradeable) {
        return OwnableUpgradeable.transferOwnership(newOwner);
    }

    function pendingOwner() public view virtual
    override(IOwnable2Step, Ownable2StepUpgradeable) returns (address) {
        return super.pendingOwner();
    }

    function registerPendingOwner(address nextPendingOwner) public override {
        return Ownable2StepUpgradeable.transferOwnership(nextPendingOwner);
    }

    function acceptOwnership() public virtual
    override(IOwnable2Step, Ownable2StepUpgradeable) {
        return super.acceptOwnership();
    }

    function _transferOwnership(address newOwner) internal virtual
    override(Ownable2StepUpgradeable) {
        return super._transferOwnership(newOwner);
    }
}

contract TestOwnable is Ownable {
    constructor() {
        initOwnable(_msgSender());
    }
}