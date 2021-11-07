import { ensUri, Pair, Token } from "./types";
import { Web3ApiClient } from "@web3api/client-js";

export async function fetchPairData(
  client: Web3ApiClient,
  inputToken: Token,
  outputToken: Token
): Promise<Pair> {
  const { data, errors } = await client.query<{
    fetchPairData: Pair
  }>({
    uri: ensUri,
    query: `query {
      fetchPairData(
        token0: $token0
        token1: $token1
      )
    }`,
    variables: {
      token0: inputToken,
      token1: outputToken
    }
  });

  if (errors) {
    throw errors;
  }

  if (!data) {
    throw Error("fetchPairData returned undefined, this should never happen");
  }

  return data.fetchPairData;
}
