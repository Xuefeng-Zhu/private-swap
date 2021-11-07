const { Command, flags } = require("@oclif/command");
const { cli } = require("cli-ux");
const { randomBytes } = require("crypto");
const ethers = require("ethers");
const Conf = require("conf");

class SetupCommand extends Command {
  async run() {
    const config = new Conf();

    const ethereumRpc = await cli.prompt("Please enter Ethereum rpc", {
      default: "https://goerli.infura.io/v3/6a04b7c89c5b421faefde663f787aa35",
    });
    const aztecRpc = await cli.prompt("Please enter Aztec rpc", {
      default: "https://api.aztec.network/falafel-defi-bridge",
    });
    const uniswapBridge = await cli.prompt(
      "Please enter Uniswap bridge adddress",
      {
        default: "0xC4528eDC0F2CaeA2b9c65D05aa9A460891C5f2d4",
      }
    );
    const ethPrivateKey = await cli.prompt(
      "What is your Ethereum private key?",
      {
        type: "hide",
        required: true,
      }
    );
    let aztecPrivateKey = await cli.prompt("What is your Aztec private key?", {
      type: "hide",
      required: false,
    });

    if (!aztecPrivateKey) {
      aztecPrivateKey = ethers.utils.hexlify(randomBytes(32));
    }

    config.set("ethereumRpc", ethereumRpc);
    config.set("aztecRpc", aztecRpc);
    config.set("uniswapBridge", uniswapBridge);
    config.set("ethPrivateKey", ethPrivateKey);
    config.set("aztecPrivateKey", aztecPrivateKey);
    config.delete("userId");
  }
}

SetupCommand.description = `setup account
`;

module.exports = SetupCommand;
