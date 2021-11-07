import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
require('dotenv').config();
require('hardhat-deploy');

const config = {
  solidity: {
    version: '0.7.5',
    settings: {
      evmVersion: 'berlin',
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    ganache: {
      url: `http://${process.env.GANACHE_HOST || 'localhost'}:8545`,
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/6a04b7c89c5b421faefde663f787aa35', // <---- YOUR INFURA ID! (or it won't work)

      accounts: {
        mnemonic: process.env.MNEMONIC,
      },
    },
    hardhat: {
      blockGasLimit: 15000000,
      gasPrice: 10,
      hardfork: 'berlin',
    },
  },
  paths: {
    artifacts: './src/artifacts',
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
};

export default config;
