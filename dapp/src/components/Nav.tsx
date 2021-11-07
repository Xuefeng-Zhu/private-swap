import React from 'react';
import { injected } from '../web3';
import { useWeb3React } from '@web3-react/core';
import {
  useColorMode,
  Link,
  Flex,
  Button,
  Image,
  Text,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, ExternalLinkIcon } from '@chakra-ui/icons';

function Nav() {
  const { active, activate, account, deactivate } = useWeb3React();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <>
      <Flex
        justify='space-between'
        align='center'
        padding='1rem 2rem 1rem 2rem'
        boxShadow='0 5px 4px 0 rgba(0,0,0,.2)'
      >
        <Flex align='center'>
          <Image
            boxSize='50'
            mr={5}
            src={process.env.PUBLIC_URL + '/imgs/polywrap.png'}
            alt='Polywrap Logo'
          />
          <Text fontStyle='italic' fontWeight='bold'>
            POLYWRAP WORKSHOP
          </Text>
        </Flex>
        <Flex align='center'>
          <Link
            mr={5}
            href='https://docs.polywrap.io/#polywrap-vs-javascript-sdks'
            isExternal
          >
            Why Polywrap? <ExternalLinkIcon mx='2px' />
          </Link>
          <Link
            mr={5}
            href='https://github.com/polywrap/uni-workshop'
            isExternal
          >
            Code <ExternalLinkIcon mx='2px' />
          </Link>
          <Link mr={5} href='https://docs.polywrap.io/' isExternal>
            Documentation <ExternalLinkIcon mx='2px' />
          </Link>
          <Button onClick={toggleColorMode} mr={5}>
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
          {active ? (
            <Button
              borderRadius='15px'
              colorScheme='green'
              onClick={() => deactivate()}
            >
              ✅ {account?.substr(0, 6)}...
            </Button>
          ) : (
            <Button
              borderRadius='15px'
              colorScheme='green'
              onClick={() => {
                activate(injected, undefined, true).catch((e) =>
                  console.log(e)
                );
              }}
            >
              Connect
            </Button>
          )}
        </Flex>
      </Flex>
    </>
  );
}

export default Nav;
