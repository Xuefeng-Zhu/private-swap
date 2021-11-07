const { AssetId } = require("@aztec/sdk");
const { Command, flags } = require("@oclif/command");
const { cli } = require("cli-ux");
const { init, ASSETS } = require("../utils/aztec");

class BalanceCommand extends Command {
  async run() {
    const { args } = this.parse(BalanceCommand);
    const { user } = await init();
    const asset = user.getAsset(AssetId[args.asset]);
    const balance = asset.balance();

    console.log(`${args.asset}: `, balance);
    this.exit();
  }
}

BalanceCommand.args = [
  {
    name: "asset",
    required: true,
    hidden: false,
    options: ASSETS,
    description: "asset symbol",
  },
];
BalanceCommand.description = `Get Aztec account balance
`;

module.exports = BalanceCommand;
