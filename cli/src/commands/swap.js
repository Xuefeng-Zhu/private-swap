const { AssetId, TxType, EthAddress, BridgeId } = require("@aztec/sdk");
const { Command, flags } = require("@oclif/command");
const { cli } = require("cli-ux");
const Conf = require("conf");
const { init, ASSETS } = require("../utils/aztec");

class SwapCommand extends Command {
  async run() {
    const inputAsset = await cli.prompt("Please enter asset symbol to sell");
    const outputAsset = await cli.prompt("Please enter asset symbol to buy");
    const amount = await cli.prompt("Please enter sell amount");
    const numTrade = await cli.prompt(
      "How many time do you want to perform this swap",
      {
        default: "1",
      }
    );
    const { sdk, user, aztecPrivateKey, walletProvider } = await init();
    const config = new Conf();
    const defiBridge = EthAddress.fromString(
      config.get("uniswapBridge", "0xC4528eDC0F2CaeA2b9c65D05aa9A460891C5f2d4")
    );

    const inputAssetId = AssetId[inputAsset];
    const outputAssetIdA = AssetId[outputAsset];
    const outputAssetIdB = 0;

    const bridgeId = new BridgeId(
      defiBridge,
      1,
      inputAssetId,
      outputAssetIdA,
      outputAssetIdB
    );
    const txFee = await sdk.getFee(inputAssetId, TxType.DEFI_DEPOSIT);
    const depositValue = sdk.toBaseUnits(inputAssetId, amount);
    const signer = sdk.createSchnorrSigner(aztecPrivateKey);

    for (let i = 1; i <= parseInt(numTrade); i++) {
      const proofOutput = await sdk.createDefiProof(
        bridgeId,
        user.id,
        depositValue,
        txFee,
        signer
      );
      const txHash = await sdk.sendProof(proofOutput);

      cli.action.start(`Wait for settlement of swap ${i}`);
      await sdk.awaitSettlement(txHash, 10000);
      await sdk.getDefiTxs(user.id);
      cli.action.stop();
    }

    this.exit();
  }
}

SwapCommand.description = `Swap assets through Uniswap bridge
`;

module.exports = SwapCommand;
