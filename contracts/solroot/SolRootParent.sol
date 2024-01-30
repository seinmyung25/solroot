// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;

import { ISolRootParant } from "./ISolRoot.sol";
import { BeaconUpgradeable } from "../proxy/beacon/BeaconUpgradeable.sol";
import { BeaconProxy } from "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import { DiamondBeaconUpgradeable, DiamondBeaconProxy } from "../proxy/beacon/DiamondBeaconUpgradeable.sol";

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import { ERC721BurnableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import { ERC721EnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";

import { SolRootERC1155 } from "./SolRootERC1155.sol";

import { IUniswapV2Pair } from "../uniswap/v2/interfaces.sol";
import { UniswapV2Factory } from "../uniswap/v2/UniswapV2Factory.sol";


import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IBeaconProxyFactory {
    event BeaconProxyCreated(address indexed contract_address);
    function deploy(bytes memory initData) external returns (address contract_address);
}

abstract contract BeaconProxyFactory is DiamondBeaconUpgradeable, IBeaconProxyFactory{
    function _deploy(bytes memory initData) internal virtual returns (address contract_address) {
        contract_address = address(new BeaconProxy(address(this), initData));
        emit BeaconProxyCreated(contract_address);
    }

    function deploy(bytes memory initData) public virtual override returns (address contract_address) {
        return _deploy(initData);
    }
}

abstract contract DiamondBeaconProxyFactory is BeaconProxyFactory {
    function _deploy(bytes memory initData) internal virtual override returns (address contract_address) {
        contract_address = address(new DiamondBeaconProxy(initData));
        emit BeaconProxyCreated(contract_address);
    }
}

contract SolRootParent is
    ISolRootParant,
    BeaconUpgradeable,
    BeaconProxyFactory,
    ERC721Upgradeable,
    ERC721BurnableUpgradeable,
    ERC721EnumerableUpgradeable
{
    constructor(address owner, string memory name, string memory symbol, address implementation) {
        initSolRootParent(owner, name, symbol, implementation);
    }

    function initSolRootParent(address owner, string memory name, string memory symbol, address implementation) initializer public {
        __Ownable_init(owner);
        __ERC721_init(name, symbol);
        __BeaconUpgradeable_init(implementation);
    }

    function deploy(bytes memory initData) public virtual override returns (address childAddres) {
        childAddres = super.deploy(initData);
        _mint(_msgSender(), uint160(childAddres));
    }

    function _increaseBalance(address account, uint128 amount) internal virtual
    override(ERC721EnumerableUpgradeable, ERC721Upgradeable) {
        super._increaseBalance(account, amount);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual
    override(ERC721EnumerableUpgradeable, ERC721Upgradeable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual
    override(ERC721EnumerableUpgradeable, ERC721Upgradeable) returns (bool) {
        return interfaceId == type(ISolRootParant).interfaceId || super.supportsInterface(interfaceId);
    }
}

contract SolRootERC1155Parent is SolRootParent, SolRootERC1155 {
    constructor(address owner, string memory name, string memory symbol, address implementation)
    SolRootParent(owner, name, symbol, implementation)
    {}

    function supportsInterface(bytes4 interfaceId) public view virtual override(SolRootERC1155, SolRootParent) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(address account, uint128 amount) internal virtual
    override(ERC721Upgradeable, SolRootParent) {
        super._increaseBalance(account, amount);
    }

    function setApprovalForAll(address operator, bool approved) public virtual override(ERC721Upgradeable, IERC721, SolRootERC1155) {
        return super.setApprovalForAll(operator, approved);
    }

    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual override(ERC721Upgradeable, SolRootERC1155) {
        return super._setApprovalForAll(owner, operator, approved);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual
    override(ERC721Upgradeable, SolRootParent) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function isApprovedForAll(address account, address operator) public view virtual override(ERC721Upgradeable, IERC721, SolRootERC1155) returns (bool) {
        return isApprovedForAll(account, operator);
    }
}

contract DiamondSolRootERC1155Parent is SolRootERC1155Parent, DiamondBeaconProxyFactory {
    constructor(address owner, string memory name, string memory symbol, address implementation)
    SolRootERC1155Parent(owner, name, symbol, implementation)
    {}

    function _deploy(bytes memory initData) internal virtual
    override(BeaconProxyFactory, DiamondBeaconProxyFactory) returns (address contract_address) {
        return super._deploy(initData);
    }

    function deploy(bytes memory initData) public virtual override(BeaconProxyFactory, SolRootParent) returns (address contract_address) {
        return super.deploy(initData);
    }
}

contract SolRootUniswapFactory is
    SolRootParent,
    UniswapV2Factory
{
    constructor(address owner, string memory name, string memory symbol, address implementation, address _feeToSetter)
    SolRootParent(owner, name, symbol, implementation)
    UniswapV2Factory(_feeToSetter)
    {}

    function deploy(bytes memory) public pure override returns (address) {
        revert("createPair");
    }

    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        require(tokenA != tokenB, "UniswapV2: IDENTICAL_ADDRESSES");
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "UniswapV2: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "UniswapV2: PAIR_EXISTS"); // single check is sufficient

        pair = SolRootParent.deploy(
            abi.encodeWithSelector(IUniswapV2Pair.initialize.selector, token0, token1)
        );

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        emit PairCreated(token0, token1, pair, allPairs.length-1);
    }
}