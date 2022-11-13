import {HardhatUserConfig} from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';

import {
  GOERLI_URL_ALCHEMY,
  ALCHEMY_API_KEY,
  META_PK1,
  ETHERSCAN_API_KEY,
  GAS_REPORTER_ENABLED,
  CMC_API_KEY
} from './config/VARS';

const config: HardhatUserConfig = {
  // solidity: '0.8.8',
  solidity: {
    compilers: [{version: '0.8.8'}, {version: '0.6.6'}]
  },
  paths: {tests: 'tests'},
  defaultNetwork: 'hardhat',
  networks: {
    localhost: {
      // url: 'http://localhost:8545',
      // chainId: 31337
      // gas: 2100000,
      // gasPrice: 2000000000
    },
    goerli: {
      url: `${GOERLI_URL_ALCHEMY}${ALCHEMY_API_KEY}`,
      accounts: [META_PK1!],
      chainId: 5,
      gas: 2100000,
      gasPrice: 2000000000
    }
  },
  namedAccounts: {
    deployer: {
      default: 0 // this will by default take the first account as deployer.
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: GAS_REPORTER_ENABLED === 'true' ? true : false, // running gas reporter slows down tests significantly
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'USD',
    // gasPrice: 21,
    coinmarketcap: CMC_API_KEY, // needed for currency to work
    token: 'ETH'
  }
};

export default config;
