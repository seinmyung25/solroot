// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { ISelectorRoleControl, IPausable, IOwnable, SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import { IWETH } from "../ERC20/IERC20.sol";
import { ERC20MintableUpgradeable } from "../ERC20/ERC20MintableUpgradeable.sol";

contract WETH is IWETH, ERC20MintableUpgradeable {
    constructor() ERC20MintableUpgradeable("Wrapped Ether", "WETH") {}

    receive() external payable {
        deposit();
    }

    function deposit() public payable {
        _mint(_msgSender(), msg.value);
    }

    function withdraw(uint256 amount) public {
        burn(amount);
        Address.sendValue(payable(_msgSender()), amount);
    }
}