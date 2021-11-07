const { AssetId, TxType } = require("@aztec/sdk");
const { Command, flags } = require("@oclif/command");
const { cli } = require("cli-ux");
const { init, ASSETS } = require("../utils/aztec");

class DepositCommand extends Command {
  async run() {
    const asset = await cli.prompt("Please enter asset symbol");
    const amount = await cli.prompt("Please enter despoit amount");

    const { sdk, user, aztecPrivateKey, walletProvider } = await init();

    const assetId = AssetId[asset];
    const value = sdk.toBaseUnits(assetId, amount);
    const txFee = await sdk.getFee(assetId, TxType.DEPOSIT);

    const signer = sdk.createSchnorrSigner(aztecPrivateKey);
    const depositor = walletProvider.getAccounts()[0];

    const proofOutput = await sdk.createDepositProof(
      assetId,
      depositor,
      user.id,
      value,
      txFee,
      signer
    );
    const signature = await sdk.signProof(proofOutput, depositor);
    await sdk.depositFundsToContract(assetId, depositor, value + txFee);

    const txHash = await sdk.sendProof(proofOutput, signature);

    await sdk.awaitSettlement(txHash, 10000);
    cli.action.stop();

    this.exit();
  }
}

DepositCommand.description = `Deposit asset into Aztec account
`;

module.exports = DepositCommand;
