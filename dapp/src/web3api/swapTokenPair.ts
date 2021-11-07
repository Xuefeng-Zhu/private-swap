import { Web3ApiClient } from "@web3api/client-js";
import { ensUri, Token } from "./types";

export async function swapTokenPair(
  client: Web3ApiClient,
  inputToken: Token,
  outputToken: Token,
  inputAmount: string,
  userAddress: string,
  allowedSlippage: string = "0.1",
  ttl: number = 120
): Promise<string> {
  const { data, errors } = await client.query<{
    swap: {
      hash: string;
    }
  }>({
    uri: ensUri,
    query: `mutation {
      swap (
        tokenIn: $tokenIn
        tokenOut: $tokenOut
        amount: $amount
        tradeType: "EXACT_INPUT"
        tradeOptions: {
          allowedSlippage: $allowedSlippage
          recipient: $recipient
          unixTimestamp: ${parseInt((new Date().getTime() / 1000).toFixed(0))}
          ttl: $ttl
        }
      )
    }`,
    variables: {
      tokenIn: inputToken,
      tokenOut: outputToken,
      amount: inputAmount,
      allowedSlippage: allowedSlippage,
      recipient: userAddress,
      ttl: ttl
    }
  });

  if (errors) {
    throw errors;
  }

  if (!data) {
    throw Error("swap returned undefined, this should never happen");
  }

  return data.swap.hash;
}
