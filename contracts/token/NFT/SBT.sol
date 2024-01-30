// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

import { ERC721SoulBoundUpgradeable } from "../ERC721/ERC721SoulBoundUpgradeable.sol";

import { NFT_Mintable } from "./NFT_Mintable.sol";

contract SBT is NFT_Mintable, ERC721SoulBoundUpgradeable {
    constructor(string memory name, string memory symbol) NFT_Mintable(name, symbol) {}

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Upgradeable, NFT_Mintable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal virtual override(ERC721Upgradeable, NFT_Mintable) {
        return super._increaseBalance(account, amount);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721SoulBoundUpgradeable, NFT_Mintable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
