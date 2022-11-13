import {network} from 'hardhat';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {verifyContract} from '../utils/verifyContract';
import {devChains, networkConfig} from '../utils/helper-hardhat-config';
import {ETHERSCAN_API_KEY} from '../config/VARS';

const deployFundMe: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  const {deployer, tokenOwner} = await getNamedAccounts();
  const chainId = network.config.chainId as number;

  // let chainId determine which (chainlink) pricefeed to use
  let ethUsdPricefeedAddress;
  if (devChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator');
    ethUsdPricefeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPricefeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const args = [ethUsdPricefeedAddress];
  const contractFundMe = await deploy('FundMe', {
    from: deployer,
    args: args,
    log: true, // custom logging, replaces console.logs
    // waitConfirmations: networkConfig[chainId]?.blockConfirmations || 0
  });

  if (!devChains.includes(network.name) && ETHERSCAN_API_KEY!) {
    await verifyContract(contractFundMe.address, args);
  }
};

deployFundMe.tags = ['all', 'fundme'];
export default deployFundMe;
