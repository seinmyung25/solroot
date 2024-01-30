// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (interfaces/IERC20.sol)

pragma solidity ^0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

import { ISelectorRoleControl } from "../../access/SelectorRoleControlUpgradeable.sol";

interface IERC20Base is IERC20, IERC20Metadata, IERC20Errors {}

interface IWETH is IERC20, IERC20Metadata {
    function deposit() external payable;

    function withdraw(uint256 amount) external;
}

interface IERC20Burnable is IERC20Base {
    function burn(uint256 amount) external;

    function burnFrom(address account, uint256 amount) external;
}

interface IERC20Mintable is IERC20Burnable {
    function mint(address to, uint256 amount) external;
}

interface ISolrootERC20Mintable is IERC20Mintable {
    function initSolrootERC20Mintable(address initialOwner, string memory name, string memory symbol) external;
}

interface ISolrootERC20Full is ISelectorRoleControl, IERC20Mintable {}
