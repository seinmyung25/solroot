// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC1155/ERC1155.sol)

pragma solidity ^0.8.20;

import "../token/ERC1155/ERC1155.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { IERC20Mintable } from "../token/ERC20/IERC20.sol";

library ERC20forUint {
    function toIERC20(uint self) internal pure returns (IERC20Mintable out) {
        assembly { out := self }
    }
    function totalSupply(uint self) internal view returns (uint256) {
        return toIERC20(self).totalSupply();
    }
    function balanceOf(uint self, address account) internal view returns (uint256) {
        return toIERC20(self).balanceOf(account);
    }
    function transfer(uint self, address to, uint256 value) internal returns (bool) {
        return toIERC20(self).transfer(to, value);
    }
    function allowance(uint self, address owner, address spender) internal view returns (uint256) {
        return toIERC20(self).allowance(owner, spender);
    }
    function approve(uint self, address spender, uint256 value) internal returns (bool) {
        return toIERC20(self).approve(spender, value);
    }
    function transferFrom(uint self, address from, address to, uint256 value) internal returns (bool) {
        return toIERC20(self).transferFrom(from, to, value);
    }
    function burnFrom(uint self, address from, uint256 value) internal {
        return toIERC20(self).burnFrom(from, value);
    }
    function mint(uint self, address to, uint256 value) internal {
        return toIERC20(self).mint(to, value);
    }
}

abstract contract SolRootERC1155 is ERC721Upgradeable, ERC1155Upgradeable {
    using Arrays for uint256[];
    using Arrays for address[];
    using ERC20forUint for uint;

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Upgradeable, ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function uri(uint256 id) public view virtual override returns (string memory) {
        return tokenURI(id);
    }

    function balanceOf(address account, uint256 id) public view virtual override returns (uint256) {
        return id.balanceOf(account);
    }

    function balanceOfBatch(
        address[] memory accounts,
        uint256[] memory ids
    ) public view virtual override returns (uint256[] memory) {
        if (accounts.length != ids.length) {
            revert ERC1155InvalidArrayLength(ids.length, accounts.length);
        }

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts.unsafeMemoryAccess(i), ids.unsafeMemoryAccess(i));
        }

        return batchBalances;
    }

    function setApprovalForAll(address operator, bool approved) public virtual override(ERC1155Upgradeable, ERC721Upgradeable) {
        return ERC721Upgradeable._setApprovalForAll(_msgSender(), operator, approved);
    }

    function isApprovedForAll(address account, address operator) public view virtual override(ERC1155Upgradeable, ERC721Upgradeable) returns (bool) {
        return ERC721Upgradeable.isApprovedForAll(account, operator);
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public virtual override {
        address sender = _msgSender();
        if (from != sender && !isApprovedForAll(from, sender)) {
            revert ERC1155MissingApprovalForAll(sender, from);
        }
        _safeTransferFrom(from, to, id, value, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) public virtual override {
        address sender = _msgSender();
        if (from != sender && !isApprovedForAll(from, sender)) {
            revert ERC1155MissingApprovalForAll(sender, from);
        }
        _safeBatchTransferFrom(from, to, ids, values, data);
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal virtual override {
        if (ids.length != values.length) {
            revert ERC1155InvalidArrayLength(ids.length, values.length);
        }

        address operator = _msgSender();

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids.unsafeMemoryAccess(i);
            uint256 value = values.unsafeMemoryAccess(i);

            if (from != address(0)) {
                uint256 fromBalance = id.balanceOf(from);
                if (fromBalance < value) {
                    revert ERC1155InsufficientBalance(from, fromBalance, value, id);
                }
                if(to != address(0)) id.transferFrom(from, to, value);
                else id.burnFrom(from, value);
            } else {
                if(to != address(0)) id.mint(to, value);
                else revert("from zero, to zero");
            }
        }

        if (ids.length == 1) {
            uint256 id = ids.unsafeMemoryAccess(0);
            uint256 value = values.unsafeMemoryAccess(0);
            emit TransferSingle(operator, from, to, id, value);
        } else {
            emit TransferBatch(operator, from, to, ids, values);
        }
    }

    function _updateWithAcceptanceCheck(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) internal virtual override {
        super._updateWithAcceptanceCheck(from, to, ids, values, data);
    }

    function _setURI(string memory) internal virtual override {
        // SRERC1155P storage $ = _getSRERC1155P();
        // $._uri = newuri;
        revert("_setURI");
    }

    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual override(ERC1155Upgradeable, ERC721Upgradeable) {
        return ERC721Upgradeable._setApprovalForAll(owner, operator, approved);
    }
}
