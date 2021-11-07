#!/usr/bin/env node
import { Contract, Signer, BigNumber, BigNumberish } from 'ethers';
import bn from 'bignumber.js';

import { ContractTransaction } from '@ethersproject/contracts';
import { UniswapV3Deployer } from 'uniswap-v3-deploy-plugin/dist/deployer/UniswapV3Deployer';
import UniswapV3FactoryJson from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import IWETH from '@uniswap/v2-periphery/build/IWETH.json';
import ERC20Mintable from '../artifacts/contracts/ERC20Mintable.sol/ERC20Mintable.json';

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

export function encodePriceSqrt(
  reserve1: BigNumberish,
  reserve0: BigNumberish
): BigNumber {
  return BigNumber.from(
    new bn(reserve1.toString())
      .div(reserve0.toString())
      .sqrt()
      .multipliedBy(new bn(2).pow(96))
      .integerValue(3)
      .toString()
  );
}

export const getMinTick = (tickSpacing: number) =>
  Math.ceil(-887272 / tickSpacing) * tickSpacing;
export const getMaxTick = (tickSpacing: number) =>
  Math.floor(887272 / tickSpacing) * tickSpacing;

export const createPair = async (
  owner: Signer,
  router: Contract,
  positionManager: Contract,
  asset: Contract,
  initialTokenSupply = 10n * 10n ** 18n,
  initialEthSupply = 10n ** 18n
) => {
  const factory = new Contract(
    await router.factory(),
    UniswapV3FactoryJson.abi,
    owner
  );
  const weth = new Contract(await router.WETH9(), IWETH.abi, owner);
  const wethErc = new Contract(await router.WETH9(), ERC20Mintable.abi, owner);

  const minConfirmations =
    [1337, 31337].indexOf(await owner.getChainId()) >= 0 ? 1 : 3;
  const withConfirmation = async (action: Promise<ContractTransaction>) => {
    const tx2 = await action;
    await tx2.wait(minConfirmations);
  };

  console.log('Arppove token...');
  await withConfirmation(asset.mint(owner.getAddress(), initialTokenSupply));
  await withConfirmation(
    asset.approve(positionManager.address, initialTokenSupply)
  );
  await withConfirmation(weth.deposit({ value: initialEthSupply }));
  await withConfirmation(
    wethErc.approve(positionManager.address, initialEthSupply)
  );

  console.log('createAndInitializePoolIfNecessary...');
  await withConfirmation(
    positionManager.createAndInitializePoolIfNecessary(
      asset.address,
      weth.address,
      3000,
      encodePriceSqrt(1, 1)
    )
  );

  console.log('mint...');
  const liquidityParams = {
    token0: asset.address,
    token1: weth.address,
    fee: 3000,
    tickLower: getMinTick(60),
    tickUpper: getMaxTick(60),
    recipient: owner.getAddress(),
    amount0Desired: 1000000,
    amount1Desired: 1000000,
    amount0Min: 0,
    amount1Min: 0,
    deadline: 1636247074938,
  };
  await withConfirmation(positionManager.mint(liquidityParams));

  console.log(`Initial token supply: ${initialTokenSupply}`);
  console.log(`Initial ETH supply: ${initialEthSupply}`);
};

export const deployUniswap = async (owner: Signer) => {
  console.log('Deploying UniswapFactory...');
  const contract = await UniswapV3Deployer.deploy(owner);

  return contract;
};
