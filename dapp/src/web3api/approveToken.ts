import { ensUri, Token } from "./types";
import { Web3ApiClient } from "@web3api/client-js";

export async function approveToken(
  client: Web3ApiClient,
  token: Token,
  amount: string
): Promise<string> {

  const { data, errors } = await client.query<{
    approve: {
      hash: string;
    };
  }>({
    uri: ensUri,
    query: `mutation {
      approve(
        token: $token
        amount: $amount
      )
    }`,
    variables: {
      token,
      amount,
    }
  });

  if (errors) {
    throw errors;
  }

  if (!data) {
    throw Error("approve returned undefined, this should never happen");
  }

  return data.approve.hash;
}
