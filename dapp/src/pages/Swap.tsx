import { useState, useEffect } from 'react';
import { tokenList } from '../constants/token-list';
import { getTokenList, TokenAmount } from '../web3api/types';
import { fetchPairData } from '../web3api/fetchPairData';
import { fetchSwapOutputAmount } from '../web3api/fetchSwapOutputAmount';
import { approvalNeeded } from '../web3api/approvalNeeded';
import { approveToken } from '../web3api/approveToken';
import { useWeb3React } from '@web3-react/core';
import {
  Flex,
  FormControl,
  Input,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  Text,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useWeb3ApiClient } from '@web3api/react';
import Decimal from 'decimal.js-light';
import { swapTokenPair } from '../web3api/swapTokenPair';
import { createWalletSdk, WalletProvider } from '@aztec/sdk';
import { useAsync } from 'react-use';

export default function Swap() {
  const { chainId, account, library } = useWeb3React();
  const client = useWeb3ApiClient();
  const [tokenInIndex, setTokenInIndex] = useState(-1);
  const [tokenOutIndex, setTokenOutIndex] = useState(-1);
  const [tokenInAmount, setTokenInAmount] = useState('');
  const [tokenOutAmount, setTokenOutAmount] = useState('...');
  const [approveNeeded, setApproveNeeded] = useState(false);
  const [incompleteData, setIncompleteData] = useState(true);
  const [awaitCalculateTokenOutAmount, setAwaitCalculateTokenOutAmount] =
    useState<Promise<void> | undefined>(undefined);

  useAsync(async () => {
    const rollupProviderUrl = 'https://api.aztec.network/falafel-defi-bridge';
    const aztecSdk = await createWalletSdk(
      new WalletProvider(library.provider),
      rollupProviderUrl,
      {
        syncInstances: false,
        saveProvingKey: false,
        clearDb: true,
        dbPath: ':memory:',
        minConfirmation: 1,
        debug: true,
        minConfirmationEHW: 1,
      }
    );
    console.log(aztecSdk);

    console.info(aztecSdk.getLocalStatus());
    // initState: 'UNINITIALIZED'

    await aztecSdk.init();

    console.info(aztecSdk.getLocalStatus());
    // initState: 'INITIALIZED'
  }, [library]);

  const calculateTokenOutAmount = async () => {
    if (tokenInIndex < 0 || tokenOutIndex < 0) {
      setIncompleteData(true);
      return;
    } else {
      setIncompleteData(false);
    }

    if (awaitCalculateTokenOutAmount) {
      await awaitCalculateTokenOutAmount;
    }

    setAwaitCalculateTokenOutAmount(
      new Promise(async (resolve, reject): Promise<void> => {
        try {
          const schemaTokenList = getTokenList();
          const inputToken = schemaTokenList[tokenInIndex];
          const outputToken = schemaTokenList[tokenOutIndex];

          const pair = await fetchPairData(client, inputToken, outputToken);

          const inputDecimals = new Decimal('10').pow(
            inputToken.currency.decimals
          );
          const tokenInAmountDec = new Decimal(tokenInAmount || '0').mul(
            inputDecimals
          );

          if (tokenInAmountDec.eq(0)) {
            setTokenOutAmount('0');
            resolve();
            return;
          }

          const inputTokenAmount: TokenAmount = {
            token: inputToken,
            amount: tokenInAmountDec.toFixed(),
          };

          const outputAmount = await fetchSwapOutputAmount(
            client,
            pair,
            inputTokenAmount
          );
          const outputDecimals = new Decimal('10').pow(
            outputToken.currency.decimals
          );
          setTokenOutAmount(
            new Decimal(outputAmount).div(outputDecimals).toFixed(6)
          );

          if (inputToken.currency.symbol === 'ETH') {
            setApproveNeeded(false);
          } else {
            setApproveNeeded(
              await approvalNeeded(
                client,
                inputToken.address,
                account as string,
                inputTokenAmount.amount
              )
            );
          }

          resolve();
        } catch (e) {
          console.error(e);
        }
        setAwaitCalculateTokenOutAmount(undefined);
      })
    );
  };

  const execSwap = async () => {
    if (incompleteData) {
      return;
    }

    const schemaTokenList = getTokenList();
    const inputToken = schemaTokenList[tokenInIndex];
    const inputDecimals = new Decimal('10').pow(inputToken.currency.decimals);
    const tokenInAmountDec = new Decimal(tokenInAmount || '0').mul(
      inputDecimals
    );

    if (approveNeeded) {
      const hash = await approveToken(
        client,
        inputToken,
        tokenInAmountDec.toFixed()
      );
      console.log('Token Allowance Approved: ', hash);
      return;
    }

    const hash = await swapTokenPair(
      client,
      inputToken,
      schemaTokenList[tokenOutIndex],
      tokenInAmountDec.toFixed(),
      account as string
    );
    console.log('Tokens Swapped: ', hash);
  };

  const TokenMenu = (props: { in?: boolean }) => (
    <MenuList>
      {chainId ? (
        tokenList
          .map((token, index) => {
            return chainId === token.chainId ? (
              <MenuItem
                key={`token-${index}`}
                onClick={() => {
                  props.in ? setTokenInIndex(index) : setTokenOutIndex(index);
                }}
              >
                {token.name} ({token.symbol})
              </MenuItem>
            ) : undefined;
          })
          .filter((value) => !!value)
      ) : (
        <MenuItem disabled={true}>Connect Wallet</MenuItem>
      )}
    </MenuList>
  );

  const TokenMenuIcon = (props: { index: number }) =>
    props.index > -1 ? (
      <Image src={tokenList[props.index].logoURI} width={'40px'} />
    ) : (
      <Text>?</Text>
    );

  useEffect(() => {
    calculateTokenOutAmount();
  }, [tokenInAmount, tokenInIndex, tokenOutIndex]);

  return (
    <>
      <FormControl maxW="35rem" boxShadow="0 2px 4px 0 rgba(0,0,0,.3)">
        <Flex direction="column" yarn st>
          <Flex>
            <Input
              borderRadius="15px"
              h={55}
              mb={5}
              mr={5}
              placeholder={'Input Amount'}
              value={tokenInAmount}
              onChange={(event) => {
                setTokenInAmount(event.target.value);
              }}
            />
            <Menu>
              <MenuButton
                borderRadius="15px"
                h={55}
                as={Button}
                rightIcon={<ChevronDownIcon />}
              >
                <TokenMenuIcon index={tokenInIndex} />
              </MenuButton>
              <TokenMenu in />
            </Menu>
          </Flex>
          <Flex>
            <Input
              disabled={true}
              borderRadius="15px"
              h={55}
              mb={10}
              mr={5}
              value={tokenOutAmount}
            />
            <Menu>
              <MenuButton
                borderRadius="15px"
                h={55}
                as={Button}
                rightIcon={<ChevronDownIcon />}
              >
                <TokenMenuIcon index={tokenOutIndex} />
              </MenuButton>
              <TokenMenu />
            </Menu>
          </Flex>
        </Flex>
        <Button
          w="100%"
          borderRadius="15px"
          size="lg"
          colorScheme="green"
          onClick={execSwap}
        >
          {incompleteData ? '...' : approveNeeded ? 'Approve' : 'Swap'}
        </Button>
      </FormControl>
    </>
  );
}
