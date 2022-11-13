import {DeployFunction} from 'hardhat-deploy/types';
import {network} from 'hardhat';

import {DECIMALS, devChains, INITIAL_ANSWER} from '../utils/helper-hardhat-config';

const deployMock: DeployFunction = async function ({deployments, getNamedAccounts}) {
  const {deploy, log} = deployments;
  const {deployer} = await getNamedAccounts();
  console.log('🚀 ~ file: 00-deploy-mocks.ts ~ line 9 ~ deployer', deployer);
  console.log('network.name', network.name);

  if (devChains.includes(network.name)) {
    log('Deploying Mocks');
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER] // _decimals, _initialAnswer
    });
    log('Mocks deployed');
    log('------------------------------------');
  }
};

export default deployMock;
deployMock.tags = ['all', 'mocks'];
