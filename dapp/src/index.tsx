import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { getLibrary } from './web3';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { Web3ReactProvider } from '@web3-react/core';

if (!!(window as any).ethereum) {
  (window as any).ethereum.autoRefreshOnNetworkChange = false;
}

// Chakra UI theme.
const styles = {
  global: (props: any) => ({
    body: {
      bg: mode('gray.100', '#1C2751')(props),
    },
  }),
};

const theme = extendTheme({
  styles,
});

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <React.StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
        <App />
      </Web3ReactProvider>
    </React.StrictMode>
  </ChakraProvider>,
  document.getElementById('root')
);
