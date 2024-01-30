// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;

import { ISolRootChild } from "./ISolRoot.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC20BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import { ERC6551AccountUpgradeable } from "../ERC6551/ERC6551AccountUpgradeable.sol";

import { IERC20Metadata } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import { UniswapV2ERC20 } from "../uniswap/v2/UniswapV2ERC20.sol";
import { UniswapV2Pair } from "../uniswap/v2/UniswapV2Pair.sol";

abstract contract SolRootChild is
    ERC6551AccountUpgradeable,
    ISolRootChild
{
    function __RootChild_init() public initializer {
        __ERC6551AccountUpgradeable_init(msg.sender, uint160(address(this)));
    }
}

contract SolRootChildERC20 is
    ERC20BurnableUpgradeable,
    SolRootChild
{
    constructor(string memory _name, string memory _symbol) {
        initSolRootChild(_name, _symbol);
    }

    function initSolRootChild(string memory _name, string memory _symbol) public initializer {
        __SolRootChildERC20_init(_name, _symbol);
    }
    function __SolRootChildERC20_init(string memory _name, string memory _symbol) internal onlyInitializing {
        __ERC20_init(_name, _symbol);
        __RootChild_init();
    }

    function mint(address to, uint256 amount) public virtual {
        require(_msgSender() == owner(), "only Owner");
        _mint(to, amount);
    }
}

contract SolRootChildUniswapPair is
    SolRootChildERC20,
    UniswapV2Pair
{
    constructor(string memory _name, string memory _symbol)
    SolRootChildERC20(_name, _name) {}

    function name() public pure override(IERC20Metadata, ERC20Upgradeable, UniswapV2ERC20) returns(string memory) {
        return super.name();
    }
    function symbol() public pure override(IERC20Metadata, ERC20Upgradeable, UniswapV2ERC20) returns(string memory) {
        return super.symbol();
    }
}

contract SolRootChildERC1155 is
    SolRootChildERC20
{
    constructor(string memory _name, string memory _symbol)
    SolRootChildERC20(_name, _symbol) {}

    function mint(address to, uint256 amount) public override {
        require(_msgSender() == owner() || _msgSender() == registry(), "Child ERC1155");
        _mint(to, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 value) internal virtual override {
        if(_msgSender() != registry()) return super._spendAllowance(owner, spender, value);
    }
}