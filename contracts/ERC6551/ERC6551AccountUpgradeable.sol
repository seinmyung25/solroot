// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC1271 } from "../ERC1271/IERC1271.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import { IERC6551Account } from "./IERC6551Account.sol";
import { IERC6551Executable } from "./IERC6551Executable.sol";

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract ERC6551AccountUpgradeable is Initializable, IERC1271, IERC6551Account, IERC6551Executable {
    /// @custom:storage-location erc7201:solroot.storage.ERC6551.account
    struct ERC6551AccountUpgradeableStorage {
        uint256 state;
        uint256 chainId;
        address tokenContract;
        uint256 tokenId;
    }

    // keccak256(abi.encode(uint256(keccak256("solroot.storage.ERC6551.account")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant ERC6551AccountUpgradeableStorageLocation = 0xbf32e4e73673efc15527263dda18d04baa796f3c468b74dd9166946804686100;

    function _getERC6551AccountStorage() private pure returns (ERC6551AccountUpgradeableStorage storage $) {
        assembly {
            $.slot := ERC6551AccountUpgradeableStorageLocation
        }
    }

    function state() public view override returns (uint256) {
        return _getERC6551AccountStorage().state;
    }

    function __ERC6551AccountUpgradeable_init(address tokenContract, uint256 tokenId) public virtual initializer {
        ERC6551AccountUpgradeableStorage storage $ = _getERC6551AccountStorage();
        require($.state == 0, "State is already set");
        $.state = 1;
        $.chainId = block.chainid;
        $.tokenContract = tokenContract;
        $.tokenId = tokenId;
    }

    receive() external payable {}

    function execute(
        address to,
        uint256 value,
        bytes calldata data,
        uint256 operation
    ) external payable returns (bytes memory result) {
        require(_isValidSigner(msg.sender), "Invalid signer");
        require(operation == 0, "Only call operations are supported");

        unchecked{ ++_getERC6551AccountStorage().state; }

        bool success;
        (success, result) = to.call{value: value}(data);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    function isValidSigner(address signer, bytes calldata) external view returns (bytes4) {
        if (_isValidSigner(signer)) {
            return IERC6551Account.isValidSigner.selector;
        }

        return bytes4(0);
    }

    function isValidSignature(bytes32 hash, bytes memory signature)
        external
        view
        returns (bytes4 magicValue)
    {
        bool isValid = SignatureChecker.isValidSignatureNow(owner(), hash, signature);

        if (isValid) {
            return IERC1271.isValidSignature.selector;
        }

        return "";
    }

    // function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
    //     return (interfaceId == type(IERC165).interfaceId ||
    //         interfaceId == type(IERC6551Account).interfaceId ||
    //         interfaceId == type(IERC6551Executable).interfaceId);
    // }

    function token() public view returns (uint256, address, uint256) {
        ERC6551AccountUpgradeableStorage storage $ = _getERC6551AccountStorage();
        return ($.chainId, $.tokenContract, $.tokenId);
    }

    function registry() public view returns (address) {
        ERC6551AccountUpgradeableStorage storage $ = _getERC6551AccountStorage();
        return $.tokenContract;
    }

    function owner() public view returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = token();
        if (chainId != block.chainid) return address(0);

        return IERC721(tokenContract).ownerOf(tokenId);
    }

    function _isValidSigner(address signer) internal view returns (bool) {
        return signer == owner();
    }
}