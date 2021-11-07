import { UNISWAP_ROUTER_CONTRACT } from "./types";
import { Web3ApiClient } from "@web3api/client-js";
import Decimal from "decimal.js-light";

export async function approvalNeeded(
  client: Web3ApiClient,
  tokenAddress: string,
  userAddress: string,
  spendAmount: string
): Promise<boolean> {

  const { data, errors } = await client.query<{
    callContractView: string;
  }>({
    uri: "ens/ethereum.web3api.eth",
    query: `query {
      callContractView(
        address: "${tokenAddress}"
        method: "function allowance(address owner, address spender) view returns (uint256)"
        args: $args
      )
    }`,
    variables: {
      args: [userAddress, UNISWAP_ROUTER_CONTRACT]
    }
  });

  if (errors) {
    throw errors;
  }

  if (!data) {
    throw Error("callContractView on ERC20 allowance returned undefined, this should never happen");
  }

  const allowance = new Decimal(data.callContractView);
  const spending = new Decimal(spendAmount);

  return allowance.gt(spending);
}
