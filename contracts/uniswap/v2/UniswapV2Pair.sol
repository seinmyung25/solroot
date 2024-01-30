// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";

import {IUniswapV2Pair, IUniswapV2Factory, IUniswapV2Callee} from "./interfaces.sol";

import {Math, UQ112x112, SafeMath} from "./libraries.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {UniswapV2ERC20} from "./UniswapV2ERC20.sol";

contract UniswapV2Pair is IUniswapV2Pair, UniswapV2ERC20 {
    function nonces(address owner) public view override(IERC20Permit, UniswapV2ERC20) returns (uint256) {
        return super.nonces(owner);
    }

    /// @custom:storage-location erc7201:openzeppelin.storage.ERC20
    struct UniswapV2PairStorage {
        address factory;
        address token0;
        address token1;

        uint112 reserve0;           // uses single storage slot, accessible via getReserves
        uint112 reserve1;           // uses single storage slot, accessible via getReserves
        uint32  blockTimestampLast; // uses single storage slot, accessible via getReserves

        uint256 price0CumulativeLast;
        uint256 price1CumulativeLast;
        uint256 kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event

        bool locked;
    }

    // keccak256(abi.encode(uint256(keccak256("solroot.storage.UniswapV2Pair")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant UniswapV2PairStorageLocation = 0x9897bb4e7388ee0b347668452b505194ddb3754964923b301bf4add0fc154300;

    function _getUniswapV2PairStorage() private pure returns (UniswapV2PairStorage storage $) {
        assembly {
            $.slot := UniswapV2PairStorageLocation
        }
    }

    using SafeMath  for uint256;
    using UQ112x112 for uint224;

    uint256 public constant MINIMUM_LIQUIDITY = 10**3;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes("transfer(address,uint256)")));

    modifier lock() {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        require(!$.locked, "V2 LOCKED");
        $.locked = true;
        _;
        $.locked = false;
    }

    function factory() external view override returns (address) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        return $.factory;
    }
    function token0() external view override returns (address) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        return $.token0;
    }
    function token1() external view override returns (address) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        return $.token1;
    }

    function getReserves() public view override returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        _reserve0 = $.reserve0;
        _reserve1 = $.reserve1;
        _blockTimestampLast = $.blockTimestampLast;
    }

    function price0CumulativeLast() external view override returns (uint256) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        return $.price0CumulativeLast;
    }
    function price1CumulativeLast() external view override returns (uint256) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        return $.price1CumulativeLast;
    }

    function kLast() external view returns (uint256) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        return $.kLast;
    }


    function _safeTransfer(address token, address to, uint256 value) private {
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(SELECTOR, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), "V2 TRANSFER_FAILED");
    }

    constructor() {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        $.factory = msg.sender;
    }

    // called once by the factory at time of deployment
    function initialize(address _token0, address _token1) external override initializer {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        // require(msg.sender == $.factory, "V2 FORBIDDEN"); // sufficient check
        $.factory = msg.sender;
        $.token0 = _token0;
        $.token1 = _token1;
    }

    // update reserves and, on the first call per block, price accumulators
    function _update(uint256 balance0, uint256 balance1, uint112 _reserve0, uint112 _reserve1) private {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();

        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, "V2 OVERFLOW");
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - $.blockTimestampLast; // overflow is desired
        if (timeElapsed > 0 && _reserve0 != 0 && _reserve1 != 0) {
            // * never overflows, and + overflow is desired
            $.price0CumulativeLast += uint256(UQ112x112.encode(_reserve1).uqdiv(_reserve0)) * timeElapsed;
            $.price1CumulativeLast += uint256(UQ112x112.encode(_reserve0).uqdiv(_reserve1)) * timeElapsed;
        }
        $.reserve0 = uint112(balance0);
        $.reserve1 = uint112(balance1);
        $.blockTimestampLast = blockTimestamp;
        emit Sync($.reserve0, $.reserve1);
    }

    // if fee is on, mint liquidity equivalent to 1/6th of the growth in sqrt(k)
    function _mintFee(uint112 _reserve0, uint112 _reserve1) private returns (bool feeOn) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();

        address feeTo = IUniswapV2Factory($.factory).feeTo();
        feeOn = feeTo != address(0);
        uint256 _kLast = $.kLast; // gas savings
        if (feeOn) {
            if (_kLast != 0) {
                uint256 rootK = Math.sqrt(uint256(_reserve0).mul(_reserve1));
                uint256 rootKLast = Math.sqrt(_kLast);
                if (rootK > rootKLast) {
                    uint256 numerator = totalSupply().mul(rootK.sub(rootKLast));
                    uint256 denominator = rootK.mul(5).add(rootKLast);
                    uint256 liquidity = numerator / denominator;
                    if (liquidity > 0) _mint(feeTo, liquidity);
                }
            }
        } else if (_kLast != 0) {
            $.kLast = 0;
        }
    }

    // this low-level function should be called from a contract which performs important safety checks
    function mint(address to) external override lock returns (uint256 liquidity) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();

        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
        uint256 balance0 = IERC20($.token0).balanceOf(address(this));
        uint256 balance1 = IERC20($.token1).balanceOf(address(this));
        uint256 amount0 = balance0.sub(_reserve0);
        uint256 amount1 = balance1.sub(_reserve1);

        bool feeOn = _mintFee(_reserve0, _reserve1);
        uint256 _totalSupply = totalSupply(); // gas savings, must be defined here since totalSupply can update in _mintFee
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amount0.mul(amount1)).sub(MINIMUM_LIQUIDITY);
           _mint(address(this), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {
            liquidity = Math.min(amount0.mul(_totalSupply) / _reserve0, amount1.mul(_totalSupply) / _reserve1);
        }
        require(liquidity > 0, "V2 Err_LIQUIDITY_MINTED");
        _mint(to, liquidity);

        _update(balance0, balance1, _reserve0, _reserve1);
        if (feeOn) $.kLast = uint256($.reserve0).mul($.reserve1); // reserve0 and reserve1 are up-to-date
        emit Mint(msg.sender, amount0, amount1);
    }

    // this low-level function should be called from a contract which performs important safety checks
    function burn(address to) external override lock returns (uint256 amount0, uint256 amount1) {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();

        (uint112 _reserve0, uint112 _reserve1,) = getReserves(); // gas savings
        address _token0 = $.token0;                                // gas savings
        address _token1 = $.token1;                                // gas savings
        uint256 balance0 = IERC20(_token0).balanceOf(address(this));
        uint256 balance1 = IERC20(_token1).balanceOf(address(this));
        uint256 liquidity = balanceOf(address(this));

        bool feeOn = _mintFee(_reserve0, _reserve1);
        uint256 _totalSupply = totalSupply(); // gas savings, must be defined here since totalSupply can update in _mintFee
        amount0 = liquidity.mul(balance0) / _totalSupply; // using balances ensures pro-rata distribution
        amount1 = liquidity.mul(balance1) / _totalSupply; // using balances ensures pro-rata distribution
        require(amount0 > 0 && amount1 > 0, "V2 Err_LIQUIDITY_BURNED");
        _burn(address(this), liquidity);
        _safeTransfer(_token0, to, amount0);
        _safeTransfer(_token1, to, amount1);
        balance0 = IERC20(_token0).balanceOf(address(this));
        balance1 = IERC20(_token1).balanceOf(address(this));

        _update(balance0, balance1, _reserve0, _reserve1);
        if (feeOn) $.kLast = uint256($.reserve0).mul($.reserve1); // reserve0 and reserve1 are up-to-date
        emit Burn(msg.sender, amount0, amount1, to);
    }

    struct MemBalanceReserves {
        uint256 balance0;
        uint256 balance1;
        uint112 reserve0;
        uint112 reserve1;
    }

    // this low-level function should be called from a contract which performs important safety checks
    function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes calldata data) external override lock {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();
        MemBalanceReserves memory _$;

        require(amount0Out > 0 || amount1Out > 0, "V2 Err_OUTPUT_AMT");
        (_$.reserve0, _$.reserve1,) = getReserves(); // gas savings
        require(amount0Out < _$.reserve0 && amount1Out < _$.reserve1, "V2 Err_LIQUIDITY");

        { // scope for _token{0,1}, avoids stack too deep errors
        address _token0 = $.token0;
        address _token1 = $.token1;
        require(to != _token0 && to != _token1, "V2 INVALID_TO");
        if (amount0Out > 0) _safeTransfer(_token0, to, amount0Out); // optimistically transfer tokens
        if (amount1Out > 0) _safeTransfer(_token1, to, amount1Out); // optimistically transfer tokens
        if (data.length > 0) IUniswapV2Callee(to).uniswapV2Call(msg.sender, amount0Out, amount1Out, data);
        _$.balance0 = IERC20(_token0).balanceOf(address(this));
        _$.balance1 = IERC20(_token1).balanceOf(address(this));
        }
        uint256 amount0In = _$.balance0 > _$.reserve0 - amount0Out ? _$.balance0 - (_$.reserve0 - amount0Out) : 0;
        uint256 amount1In = _$.balance1 > _$.reserve1 - amount1Out ? _$.balance1 - (_$.reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, "V2 Err_INPUT_AMT");
        { // scope for reserve{0,1}Adjusted, avoids stack too deep errors
        uint256 balance0Adjusted = _$.balance0.mul(1000).sub(amount0In.mul(3));
        uint256 balance1Adjusted = _$.balance1.mul(1000).sub(amount1In.mul(3));
        require(balance0Adjusted.mul(balance1Adjusted) >= uint256(_$.reserve0).mul(_$.reserve1).mul(1000**2), "V2 K");
        }

        _update(_$.balance0, _$.balance1, _$.reserve0, _$.reserve1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    // force balances to match reserves
    function skim(address to) external override lock {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();

        address _token0 = $.token0; // gas savings
        address _token1 = $.token1; // gas savings
        _safeTransfer(_token0, to, IERC20(_token0).balanceOf(address(this)).sub($.reserve0));
        _safeTransfer(_token1, to, IERC20(_token1).balanceOf(address(this)).sub($.reserve1));
    }

    // force reserves to match balances
    function sync() external override lock {
        UniswapV2PairStorage storage $ = _getUniswapV2PairStorage();

        _update(IERC20($.token0).balanceOf(address(this)), IERC20($.token1).balanceOf(address(this)), $.reserve0, $.reserve1);
    }
}
