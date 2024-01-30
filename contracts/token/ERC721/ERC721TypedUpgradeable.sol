// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { IERC721Metadata } from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721URIStorageUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import { IERC721SequencialMintUpbradeable, ERC721SequencialMintUpbradeable } from "./ERC721SequencialMintUpbradeable.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

interface IERC721Typed is IERC721SequencialMintUpbradeable {
    event TokenType(uint256 indexed tokenId, uint256 indexed _tokenType);

    function tokenType(uint256 tokenId) external view returns (uint256);

    function typeSupply(uint256 _tokenType) external view returns (uint256 supply);

    function setBaseURI(string memory baseURI) external;

    function setTokenType(uint256 tokenId, uint256 _tokenType) external;

    function typedMint(address to, uint256 _tokenType) external returns (uint256 tokenId);
}

library ConcatChain {
    function concat(string memory self, string memory other) internal pure returns (string memory) {
        return string.concat(self, other);
    }
}

abstract contract ERC721TypedUpgradeable is IERC721Typed, ERC721SequencialMintUpbradeable {
    using Strings for uint256;
    using ConcatChain for string;

    struct ERC721TypedUpgradeableStorage {
        string baseURI;
        mapping(uint256 tokenId => uint256 types) tokenTypes;
        mapping(uint256 tokenType => uint256 amount) typeSupply;
    }

    // keccak256(abi.encode(uint256(keccak256("solroot.storage.ERC721TypedUpgradeable")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC721TypedUpgradeableStorageLocation =
        0x6b9109c1882b408900aea2a63dba2eb4c84da7c5e32f27d32b30a02ffde10100;

    function _getERC721TypedUpgradeable() private pure returns (ERC721TypedUpgradeableStorage storage $) {
        assembly {
            $.slot := ERC721TypedUpgradeableStorageLocation
        }
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _getERC721TypedUpgradeable().baseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(IERC721Metadata, ERC721Upgradeable) returns (string memory) {
        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 ? baseURI.concat(tokenType(tokenId).toString()).concat(".json") : "";
    }

    function tokenType(uint256 tokenId) public view override returns (uint256) {
        _requireOwned(tokenId);
        return _getERC721TypedUpgradeable().tokenTypes[tokenId];
    }

    function typeSupply(uint256 _tokenType) external view returns (uint256 supply) {
        return _getERC721TypedUpgradeable().typeSupply[_tokenType];
    }

    function _setTokenType(uint256 tokenId, uint256 typeFrom, uint256 typeTo) internal virtual {
        ERC721TypedUpgradeableStorage storage $ = _getERC721TypedUpgradeable();
        unchecked {
            $.typeSupply[typeFrom] -= 1;
            $.typeSupply[typeTo] += 1;
        }

        $.tokenTypes[tokenId] = typeTo;
        emit TokenType(tokenId, typeTo);
    }

    function _nextMint(address to) internal virtual override returns (uint256 tokenId) {
        return _typedMint(to, 0);
    }

    function _typedMint(address to, uint256 _tokenType) internal virtual returns (uint256 tokenId) {
        tokenId = super._nextMint(to);
        unchecked {
            _getERC721TypedUpgradeable().typeSupply[0] += 1;
        }
        _setTokenType(tokenId, 0, _tokenType);
    }

    function setBaseURI(string memory baseURI) public override onlyAdmin {
        require(bytes(baseURI).length != 0, "URI length");
        _getERC721TypedUpgradeable().baseURI = baseURI;
    }

    function typedMint(address to, uint256 _tokenType) public override onlyAdmin returns (uint256 tokenId) {
        tokenId = _typedMint(to, _tokenType);
    }

    function setTokenType(uint256 tokenId, uint256 _tokenType) public override onlyAdmin {
        require(tokenType(tokenId) != _tokenType, "set type");
        return _setTokenType(tokenId, tokenType(tokenId), _tokenType);
    }

    function burn(uint256 tokenId) public virtual override {
        unchecked {
            _getERC721TypedUpgradeable().typeSupply[tokenType(tokenId)] -= 1;
        }
        _update(address(0), tokenId, _msgSender());
    }
}
