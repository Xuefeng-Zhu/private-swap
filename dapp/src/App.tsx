import React from 'react';
import { Flex } from '@chakra-ui/react';
import Swap from './pages/Swap';
import Nav from './components/Nav';
import Web3ApiManager from './web3api/Web3ApiManager';

function App() {
  return (
    <Web3ApiManager>
      <>
        <Nav />
        <Flex
          mt={-20}
          height='100vh'
          justify='center'
          align='center'
          direction='column'
        >
          <Swap />
        </Flex>
      </>
    </Web3ApiManager>
  );
}

export default App;
