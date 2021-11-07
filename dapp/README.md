# Custom Uniswap dApp (Using Polywrap)
> NOTE: If at any point during this tutorial you feel stuck, you can see the completed project [here](TODO). Additionally please feel free to reach out to us on [Discord](http://discord.polywrap.io/) if you have any questions, or need some hands on help.

## 0. Pre-Requisites
Have installed:
- Node.JS
- NVM (Node Version Manager)
- Yarn

Have a basic understanding of:
- GraphQL
- Ethereum
- MetaMask
- Uniswap

## 1. Installation
From within this directory, run the following commands:
* `nvm install` - install the version of node listed in the `.nvmrc` file.
* `nvm use` - use the version of node listed in the `.nvmrc` file.
* `yarn` - install all package.json dependencies.

## 2. Start The App
Run `yarn start` within this directory, and you should see a web app open in your browser, hosted at `localhost:3000`. If none appears, navigate to the localhost URL manually.

As you can see, we have a basic web app, ready to have Uniswap integrated. You can:
* Connect your MetaMask wallet.
* Select tokens from the drop-down.
* Input an amount of toeksn you'd like to swap.

Let's get started with the fun parts :)

## 3. Fetch Token Output Amounts
The first bit of integration we'll be adding is fetching the "pair output amount". In Uniswap, a "pair" is a grouping of 2 tokens, where one is being swapped for the other.

The rate at which these two tokens will be swapped is changing constantly. So, inside our app we're going to be fetching a "fresh" value for the user to see.

Navigate to this file:  
[`./src/web3api/fetchSwapOutputAmount.ts`](./src/web3api/fetchSwapOutputAmount.ts)

And add the following code:  
```typescript
import { ensUri, Pair, TokenAmount } from "./types";
import { Web3ApiClient } from "@web3api/client-js";

export async function fetchSwapOutputAmount(
  client: Web3ApiClient,
  pair: Pair,
  inputAmount: TokenAmount
): Promise<string> {

  const { data, errors } = await client.query<{
    pairOutputAmount: TokenAmount
  }>({
    uri: ensUri, // ENS -> IPFS -> Wasm downloaded & run right inside your app
    query: `query{
      pairOutputAmount(
        pair: $pair
        inputAmount: $input
      )
    }`,
    variables: {
      pair: pair,
      input: inputAmount
    }
  });

  if (errors) {
    throw errors;
  }

  if (!data) {
    throw Error("pairOutputAmount returned undefined, this should never happen");
  }

  return data.pairOutputAmount.amount;
}
```

Now, if you run your app again, every time you modify the input amount you'll see an amount show up for the output token. This amount is being calculated inside the polywrapper, based on data fetched from the blockchain!

## 4. Allow Uniswap To Swap Your ERC20s
The first step is to check to see if we need approval in the first place.

Navigate to this file:  
[`./src/web3api/approvalNeeded.ts`](./src/web3api/approvalNeeded.ts)

And add the following code:  
```typescript
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
```

Now that we have our pre-check, making sure the user hasn't already approved the Uniswap protocol to swap their ERC20s, we can implement the actual approval call.

In this file:  
[`./src/web3api/approveToken.ts`](./src/web3api/approveToken.ts)

Add the following code:  
```typescript
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
```

Now if you start the app again, you'll notice that the "Swap" button asks you to "Approve" if you haven't already.

## 5. Finally, We Swap
The moment you've all been waiting for, the swap!

In the following file:  
[`./src/web3api/swapTokenPair.ts`](./src/web3api/swapTokenPair.ts)

Add the following code:  
```typescript
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
```

And just like that, we have swapping functionality! Give it a try for yourself :)

## Recap
As you've just seen, integrating Web3 protocols into your applications has never been so easy. Polywrap makes interacting with Web3 just like it used to be in Web2, WITHOUT sacraficing decentralization.

Polywrap is Web3 composability on steroids for dApp developers, and we hope that this simple tutorial is starting to give you a better idea of why this is so.

If you'd like to learn more, checkout our landing page & documentation:
https://polywrap.io

If you have any questions, don't hesitate to reach out:
http://discord.polywrap.io

## Resources
Try The Uniswap <> Polywrap Demo App:  
https://demo.uniswap.polywrap.io/

Checkout the demo's source-code:  
https://github.com/polywrap/uniswap-interface/tree/polywrap
