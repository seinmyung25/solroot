// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";


import {IUniswapV2ERC20} from "./interfaces.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";

abstract contract UniswapV2ERC20 is IUniswapV2ERC20, ERC20PermitUpgradeable {
    function name() public pure virtual override(IERC20Metadata, ERC20Upgradeable) returns(string memory) {
        return "Uniswap V2(solroot)";
    }
    function symbol() public pure virtual override(IERC20Metadata, ERC20Upgradeable) returns(string memory) {
        return "UNI-V2(SR)";
    }

    function nonces(address owner) public view virtual override(IERC20Permit, ERC20PermitUpgradeable) returns (uint256) {
        return super.nonces(owner);
    }
}
