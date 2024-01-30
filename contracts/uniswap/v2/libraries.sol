// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { IUniswapV2Pair } from "./interfaces.sol";
import { IUniswapV2Factory } from "./interfaces.sol";

import { TransferHelper } from "../libs/TransferHelper.sol";

library Math {
    function min(uint x, uint y) internal pure returns (uint z) {
        z = x < y ? x : y;
    }

    // babylonian method (https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method)
    function sqrt(uint y) internal pure returns (uint z) {
        unchecked {
            if (y > 3) {
                z = y;
                uint x = y / 2 + 1;
                while (x < z) {
                    z = x;
                    x = (y / x + x) / 2;
                }
            } else if (y != 0) {
                z = 1;
            }
        }
    }
}

library SafeMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        unchecked { require((z = x + y) >= x, "add"); }
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        unchecked { require((z = x - y) <= x, "sub"); }
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        unchecked { require(y == 0 || (z = x * y) / y == x, "mul"); }
    }
}

// range: [0, 2**112 - 1]
// resolution: 1 / 2**112

library UQ112x112 {
    uint224 constant Q112 = 2**112;

    // encode a uint112 as a UQ112x112
    function encode(uint112 y) internal pure returns (uint224 z) {
        unchecked { z = uint224(y) * Q112; } // never overflows
    }

    // divide a UQ112x112 by a uint112, returning a UQ112x112
    function uqdiv(uint224 x, uint112 y) internal pure returns (uint224 z) {
        unchecked { z = x / uint224(y); }
    }
}

library UniswapV2Library {
    using SafeMath for uint;

    // returns sorted token addresses, used to handle return values from pairs sorted in this order
    function sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "IDENTICAL");
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), "ZERO");
    }

    // calculates the CREATE2 address for a pair without making any external calls
    function pairFor(address factory, address tokenA, address tokenB) internal view returns (address pair) {
        (address token0, address token1) = sortTokens(tokenA, tokenB);
        // sein: hotfix for.. testing
        pair = IUniswapV2Factory(factory).getPair(token0, token1);
        // // TODO uint160 to bytes20?
        // pair = address(uint160(bytes20(
        //     keccak256(abi.encodePacked(
        //         hex"ff",
        //         factory,
        //         keccak256(abi.encodePacked(token0, token1)),
        //         hex"887e142b2558d44e4f8c8f28c776a3317d4777d12b6897e88e8089cc82a80f39" // TODO: side effect to v2 pair
        //         // hex"96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f" // init code hash(origin)
        //     ))
        // )));
    }

    // fetches and sorts the reserves for a pair
    function getReserves(address factory, address tokenA, address tokenB) internal view returns (uint reserveA, uint reserveB) {
        (address token0,) = sortTokens(tokenA, tokenB);
        (uint reserve0, uint reserve1,) = IUniswapV2Pair(pairFor(factory, tokenA, tokenB)).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }

    // given some amount of an asset and pair reserves, returns an equivalent amount of the other asset
    function quote(uint amountA, uint reserveA, uint reserveB) internal pure returns (uint amountB) {
        require(amountA > 0, "AMT");
        require(reserveA > 0 && reserveB > 0, "Liq"); // Liquidity
        unchecked { amountB = amountA.mul(reserveB) / reserveA; }
    }

    // given an input amount of an asset and pair reserves, returns the maximum output amount of the other asset
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) internal pure returns (uint amountOut) {
        require(amountIn > 0, "IN_AMT");
        require(reserveIn > 0 && reserveOut > 0, "Liq"); // Liquidity
        uint amountInWithFee = amountIn.mul(997);
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(1000).add(amountInWithFee);
        unchecked { amountOut = numerator / denominator; }
    }

    // given an output amount of an asset and pair reserves, returns a required input amount of the other asset
    function getAmountIn(uint amountOut, uint reserveIn, uint reserveOut) internal pure returns (uint amountIn) {
        require(amountOut > 0, "OUT_AMT");
        require(reserveIn > 0 && reserveOut > 0, "Liq"); // Liquidity
        uint numerator = reserveIn.mul(amountOut).mul(1000);
        uint denominator = reserveOut.sub(amountOut).mul(997);
        unchecked { amountIn = (numerator / denominator).add(1); }
    }

    // performs chained getAmountOut calculations on any number of pairs
    function getAmountsOut(address factory, uint amountIn, address[] memory path) internal view returns (uint[] memory amounts) {
        require(path.length >= 2, "PATH");
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        for (uint i; i < path.length - 1; i++) {
            (uint reserveIn, uint reserveOut) = getReserves(factory, path[i], path[i + 1]);
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    // performs chained getAmountIn calculations on any number of pairs
    function getAmountsIn(address factory, uint amountOut, address[] memory path) internal view returns (uint[] memory amounts) {
        require(path.length >= 2, "PATH");
        amounts = new uint[](path.length);
        amounts[amounts.length - 1] = amountOut;
        for (uint i = path.length - 1; i > 0; i--) {
            (uint reserveIn, uint reserveOut) = getReserves(factory, path[i - 1], path[i]);
            amounts[i - 1] = getAmountIn(amounts[i], reserveIn, reserveOut);
        }
    }
}