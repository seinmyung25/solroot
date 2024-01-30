// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { SelectorRoleControlUpgradeable, AccessControlEnumerableUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

import { ERC721PausableUpgradeable } from "../ERC721/ERC721PausableUpgradeable.sol";
import { IERC721Queryable, ERC721QueryableUpgradeable } from "../ERC721/ERC721QueryableUpgradeable.sol";
import { IERC721SequencialMintUpbradeable, ERC721SequencialMintUpbradeable } from "../ERC721/ERC721SequencialMintUpbradeable.sol";

interface INFT_Mintable is IERC721SequencialMintUpbradeable, IERC721Queryable {}

// INFT_Mintable,
contract NFT_Mintable is
    INFT_Mintable,
    ERC721SequencialMintUpbradeable,
    ERC721PausableUpgradeable,
    ERC721QueryableUpgradeable
{
    constructor(string memory name, string memory symbol) {
        initNFT_Mintable(_msgSender(), name, symbol);
    }

    function initNFT_Mintable(address initialOwner, string memory name, string memory symbol) public initializer {
        __Ownable_init(initialOwner);
        __ERC721_init(name, symbol);
    }

    function paused() public view virtual override(PausableUpgradeable, SelectorRoleControlUpgradeable) returns (bool) {
        return super.paused();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721SequencialMintUpbradeable, ERC721Upgradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(
        address account,
        uint128 amount
    ) internal virtual override(ERC721Upgradeable, ERC721SequencialMintUpbradeable) {
        return super._increaseBalance(account, amount);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721PausableUpgradeable, ERC721SequencialMintUpbradeable) returns (address) {
        return super._update(to, tokenId, auth);
    }
}
