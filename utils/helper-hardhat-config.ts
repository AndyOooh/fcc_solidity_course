export interface NetworkConfigInterface {
  [chainId: number]: {
    name: string;
    ethUsdPriceFeed: string;
    blockConfirmations: number;
  };
}

export const networkConfig: NetworkConfigInterface = {
   // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
  5: {
    name: 'goerli',
    ethUsdPriceFeed: '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
    blockConfirmations: 5,
  },
  137: {
    name: 'polygon',
    ethUsdPriceFeed: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    blockConfirmations: 5,
  },
  80001: {
    name: 'mumbai', //polygon testnet
    ethUsdPriceFeed: '0x0715A7794a1dc8e42615F059dD6e406A6594651A',
    blockConfirmations: 5,
  }
};

export const devChains = ['hardhat', 'localhost'];

export const DECIMALS = 8;
export const INITIAL_ANSWER = 20000000000; // 200 + 8 dec.
