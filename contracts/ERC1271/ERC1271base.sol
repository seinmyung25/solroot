// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "./IERC1271.sol";

// TODO update ERC7201 pattern style
contract ERC1271 is IERC1271 {
    address private _owner;

    constructor(address owner_) {
        _owner = owner_;
    }

    function owner() public view returns(address) {
        return _owner;
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
}