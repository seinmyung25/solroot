// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC721/ERC721.sol)

pragma solidity ^0.8.0;

import { ISelectorRoleControl, IPausable, IOwnable, SelectorRoleControlUpgradeable } from "../../access/SelectorRoleControlUpgradeable.sol";

import { ERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import { ERC20BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";

import { IERC20Metadata, IERC20Base, IERC20Burnable, IERC20Mintable, ISolrootERC20Mintable, IERC20 } from "./IERC20.sol";

abstract contract ERC20Decimal is ERC20Upgradeable {
    uint8 private immutable _decimals_;

    constructor(uint8 _decimals) {
        _decimals_ = _decimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals_;
    }
}

contract ERC20MintableUpgradeable is
    ISolrootERC20Mintable,
    SelectorRoleControlUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable
{
    constructor(string memory name, string memory symbol) initializer {
        initSolrootERC20Mintable(_msgSender(), name, symbol);
    }

    function initSolrootERC20Mintable(
        address initialOwner,
        string memory name,
        string memory symbol
    ) public override initializer {
        __Ownable_init(initialOwner);
        __ERC20_init(name, symbol);
    }

    function mint(address to, uint256 amount) public virtual override onlyAdmin {
        _mint(to, amount);
    }

    function burn(uint256 amount) public virtual override(IERC20Burnable, ERC20BurnableUpgradeable) {
        return super.burn(amount);
    }

    function burnFrom(
        address account,
        uint256 amount
    ) public virtual override(IERC20Burnable, ERC20BurnableUpgradeable) {
        return super.burnFrom(account, amount);
    }
}

contract ERC20MintableUpgradeableWithDecimal is ERC20MintableUpgradeable, ERC20Decimal {
    constructor(
        string memory name,
        string memory symbol,
        uint8 _decimals
    ) initializer ERC20MintableUpgradeable(name, symbol) ERC20Decimal(_decimals) {}

    function decimals() public view virtual override(IERC20Metadata, ERC20Upgradeable, ERC20Decimal) returns (uint8) {
        return super.decimals();
    }
}
