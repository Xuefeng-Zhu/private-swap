// deploy/00_deploy_your_contract.js

// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log(deployer);
  await deploy('UniswapBridge', {
    from: deployer,
    args: [
      '0xA7b3Fe0ac95310b65Ec17CAc64cF6a07cD173A19',
      '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    ],
    log: true,
  });
};
module.exports.tags = ['UniswapBridge'];
