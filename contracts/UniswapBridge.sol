// SPDX-License-Identifier: GPL-2.0-only
// Copyright 2020 Spilsbury Holdings Ltd
pragma solidity >=0.6.6 <0.8.0;
pragma experimental ABIEncoderV2;

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {IPeripheryImmutableState} from "@uniswap/v3-periphery/contracts/interfaces/IPeripheryImmutableState.sol";

import {IDefiBridge} from "./interfaces/IDefiBridge.sol";
import {Types} from "./Types.sol";

// import 'hardhat/console.sol';

contract UniswapBridge is IDefiBridge {
    using SafeMath for uint256;

    address public immutable rollupProcessor;
    address public weth;

    ISwapRouter router;

    constructor(address _rollupProcessor, address _router) public {
        rollupProcessor = _rollupProcessor;
        router = ISwapRouter(_router);
        weth = IPeripheryImmutableState(_router).WETH9();
    }

    receive() external payable {}

    function convert(
        Types.AztecAsset calldata inputAssetA,
        Types.AztecAsset calldata,
        Types.AztecAsset calldata outputAssetA,
        Types.AztecAsset calldata,
        uint256 inputValue,
        uint256,
        uint64
    )
        external
        payable
        override
        returns (
            uint256 outputValueA,
            uint256,
            bool isAsync
        )
    {
        require(msg.sender == rollupProcessor, "UniswapBridge: INVALID_CALLER");
        isAsync = false;
        uint256 amountOutMinimum = 1;
        uint160 sqrtPriceLimitX96 = 0;
        uint256 deadline = block.timestamp;
        // TODO This should check the pair exists on UNISWAP instead of blindly trying to swap.

        if (
            inputAssetA.assetType == Types.AztecAssetType.ETH &&
            outputAssetA.assetType == Types.AztecAssetType.ERC20
        ) {
            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
                .ExactInputSingleParams(
                    weth,
                    outputAssetA.erc20Address,
                    3000,
                    rollupProcessor,
                    deadline,
                    inputValue,
                    amountOutMinimum,
                    sqrtPriceLimitX96
                );

            uint256 amountOut = router.exactInputSingle{value: inputValue}(
                params
            );

            outputValueA = amountOut;
        } else if (
            inputAssetA.assetType == Types.AztecAssetType.ERC20 &&
            outputAssetA.assetType == Types.AztecAssetType.ETH
        ) {
            require(
                IERC20(inputAssetA.erc20Address).approve(
                    address(router),
                    inputValue
                ),
                "UniswapBridge: APPROVE_FAILED"
            );

            ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
                .ExactInputSingleParams(
                    outputAssetA.erc20Address,
                    weth,
                    3000,
                    rollupProcessor,
                    deadline,
                    inputValue,
                    amountOutMinimum,
                    sqrtPriceLimitX96
                );

            uint256 amountOut = router.exactInputSingle(params);

            outputValueA = amountOut;
        } else {
            // TODO what about swapping tokens?
            revert("UniswapBridge: INCOMPATIBLE_ASSET_PAIR");
        }
    }

    function canFinalise(
        uint256 /*interactionNonce*/
    ) external view override returns (bool) {
        return false;
    }

    function finalise(uint256)
        external
        payable
        override
        returns (uint256, uint256)
    {
        require(false);
    }
}
