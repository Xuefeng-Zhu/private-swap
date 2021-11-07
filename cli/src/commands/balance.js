const { AssetId } = require("@aztec/sdk");
const { Command, flags } = require("@oclif/command");
const ethers = require("ethers");
const { init, ASSETS } = require("../utils/aztec");

class BalanceCommand extends Command {
  async run() {
    const { sdk, user } = await init();

    for (let asset of ASSETS) {
      const balance = sdk.getBalance(AssetId[asset], user.id);
      console.log(`${asset}: `, ethers.utils.formatUnits(balance));
    }
    this.exit();
  }
}

BalanceCommand.description = `Get Aztec account balances
`;

module.exports = BalanceCommand;
