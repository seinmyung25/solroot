// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;

import { IBeacon } from "@openzeppelin/contracts/proxy/beacon/IBeacon.sol";

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

interface ISolRootParant is IBeacon {
}

interface ISolRootChild is IERC20Metadata {

}