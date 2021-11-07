const {
  AssetId,
  BridgeId,
  AccountId,
  createWalletSdk,
  EthAddress,
  TxType,
  WalletProvider,
  EthersAdapter,
} = require("@aztec/sdk");
const { JsonRpcProvider } = require("@ethersproject/providers");
const ethers = require("ethers");
const Conf = require("conf");
const _ = require("lodash");

const init = async () => {
  const config = new Conf();
  const ethereumRpc = config.get("ethereumRpc");
  const aztecRpc = config.get("aztecRpc");
  const ethPrivateKey = config.get("ethPrivateKey");
  const aztecPrivateKey = config.get("aztecPrivateKey");
  const userId = config.get("userId");

  const ethersProvider = new JsonRpcProvider(ethereumRpc);
  const ethereumProvider = new EthersAdapter(ethersProvider);
  const walletProvider = new WalletProvider(ethereumProvider);
  walletProvider.addAccount(ethPrivateKey);

  sdk = await createWalletSdk(walletProvider, aztecRpc, {
    syncInstances: false,
    saveProvingKey: false,
    dbPath: "./db",
    minConfirmation: 1,
    // debug: true,
    minConfirmationEHW: 1,
  });
  await sdk.init();
  await sdk.awaitSynchronised();

  let user;
  if (!userId) {
    user = await sdk.addUser(Buffer.from(aztecPrivateKey, "hex"));
    config.set("userId", user.id.toString());
  } else {
    user = sdk.getUser(AccountId.fromString(userId));
  }

  return {
    sdk,
    user,
  };
};

const ASSETS = Object.keys(AssetId).filter((asset) =>
  _.isNaN(_.toNumber(asset))
);

module.exports = {
  init,
  ASSETS,
};
