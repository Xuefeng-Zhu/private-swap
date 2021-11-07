const { AssetId, TxType } = require("@aztec/sdk");
const { Command, flags } = require("@oclif/command");
const { cli } = require("cli-ux");
const { init, ASSETS } = require("../utils/aztec");

class WithdrawCommand extends Command {
  async run() {
    const asset = await cli.prompt("Please enter asset symbol");
    const amount = await cli.prompt("Please enter withdraw amount");

    const { sdk, user, aztecPrivateKey, walletProvider } = await init();

    const assetId = AssetId[asset];
    const value = sdk.toBaseUnits(assetId, amount);
    const txFee = await sdk.getFee(assetId, TxType.WITHDRAW_TO_WALLET);
    const signer = sdk.createSchnorrSigner(aztecPrivateKey);
    const recipient = walletProvider.getAccounts()[0];

    const proofOutput = await sdk.createWithdrawProof(
      assetId,
      user.id,
      value,
      txFee,
      signer,
      recipient
    );
    const txHash = await sdk.sendProof(proofOutput);

    cli.action.start("Wait for settlement");
    await sdk.awaitSettlement(txHash, 10000);
    cli.action.stop();

    this.exit();
  }
}

WithdrawCommand.description = `Deposit asset into Aztec account
`;

module.exports = WithdrawCommand;
