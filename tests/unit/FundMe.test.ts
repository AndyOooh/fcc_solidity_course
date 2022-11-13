import {assert, expect} from 'chai';
import {deployments, ethers, getNamedAccounts, network} from 'hardhat';
// import {beforeEach, describe} from 'mocha'; // this causes an error

import {FundMe, MockV3Aggregator} from '../../typechain-types';
import {devChains} from '../../utils/helper-hardhat-config';

!devChains.includes(network.name)
  ? describe.skip
  : describe('FundMe', async () => {
      let deployer: string;
      let fundMe: FundMe;
      let mockV3Aggregator: MockV3Aggregator;
      const sendValue = ethers.utils.parseEther('2');

      beforeEach(async () => {
        // deploy FundMe using hardhat deploy plugin
        try {
          deployer = (await getNamedAccounts()).deployer; // as set up i hardhat.config.ts. we set defeult to 0, so will get the first entry in accounts array of specified network. Doesn't work with ts? Or just when using SignerWithAddress?
          // const {deploy, log, fixture} = deployments; // fixture deploys everything in deploy folder
          await deployments.fixture(['all']);
          fundMe = await ethers.getContract('FundMe', deployer); // gets the most recent deployed instance of the contract. param2 (signer) is optional.
          mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer); // hardhat deploy function.
        } catch (error) {
          console.log('🚀 ~ file: FundMe.test.ts ~ line 25 ~ error', error);
        }
      });

      describe('constructor', async () => {
        it('sets the aggregator addresses correctly', async () => {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe('fund', async () => {
        it('fails if not enough ETH is sent', async () => {
          await expect(fundMe.fund()).to.be.revertedWith('You need to spend more ETH!');
        });
        it('updates the amount funded', async () => {
          try {
            await fundMe.fund({value: sendValue});
            const response = await fundMe.getAddressToAmountFunded(deployer); // response is a BigNumber
            assert.equal(response.toString(), sendValue.toString());
          } catch (error) {
            console.log('🚀 ~ file: FundMe.test.ts ~ line 50 ~ error', error);
          }
        });
        it('adds sender to funders array', async () => {
          try {
            await fundMe.fund({value: sendValue});
            const funder = await fundMe.getFunder(0);
            assert.equal(funder, deployer);
          } catch (error) {
            console.log('🚀 ~ file: FundMe.test.ts ~ line 62 ~ error', error);
          }
        });
      });

      describe('withdraw', async () => {
        beforeEach('fund the contract from two accounts', async () => {
          await fundMe.fund({value: sendValue});
        });
        it('gives a single funder all their ETH back', async () => {
          // arrange --------------------------------
          const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
          const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

          // act --------------------------------
          // (entire fundeMe balance shold transfer to deployer)
          const txResponse = await fundMe.withdraw();
          const txReceipt = await txResponse.wait(1);
          const {gasUsed, effectiveGasPrice} = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMebalance = await fundMe.provider.getBalance(fundMe.address); // could use ethers.provider instead
          const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

          // assert --------------------------------
          assert.equal(endingFundMebalance.toString(), '0');
          // assert.equal(+startingFundMeBalance + +startingDeployerBalance, +endingDeployerBalance); // close but not equal
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it('allows us to withdraw with multiple funcders', async () => {
          // arrange --------------------------------
          const accounts = await ethers.getSigners();
          // Fund accounts 1 - 6.
          for (let i = 1; i < 6; i++) {
            const funderConnectedContract = fundMe.connect(accounts[i]);
            await funderConnectedContract.fund({value: sendValue});
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
          const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

          // act ------------------------------------
          const txResponse = await fundMe.withdraw();
          const txReceipt = await txResponse.wait(1);
          const {gasUsed, effectiveGasPrice} = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMebalance = await fundMe.provider.getBalance(fundMe.address); // could use ethers.provider instead
          const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

          // assert ---------------------------------
          assert.equal(endingFundMebalance.toString(), '0');
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(
              (await fundMe.getAddressToAmountFunded(accounts[i].address)).toString(),
              '0'
            );
          }
        });
        it('only allows the owner to withdraw', async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          // const attacker = (await ethers.getSigners())[1];

          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(
            fundMe,
            'FundMe__NotOwner'
          );
        });
      });
      describe('cheaperWithdraw', async () => {
        beforeEach('fund the contract from two accounts', async () => {
          await fundMe.fund({value: sendValue});
        });
        it('gives a single funder all their ETH back', async () => {
          // arrange --------------------------------
          const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
          const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

          // act --------------------------------
          // (entire fundeMe balance shold transfer to deployer)
          const txResponse = await fundMe.cheaperWithdraw();
          const txReceipt = await txResponse.wait(1);
          const {gasUsed, effectiveGasPrice} = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMebalance = await fundMe.provider.getBalance(fundMe.address); // could use ethers.provider instead
          const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

          // assert --------------------------------
          assert.equal(endingFundMebalance.toString(), '0');
          // assert.equal(+startingFundMeBalance + +startingDeployerBalance, +endingDeployerBalance); // close but not equal
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it('allows us to withdraw with multiple funcders', async () => {
          // arrange --------------------------------
          const accounts = await ethers.getSigners();
          // Fund accounts 1 - 6.
          for (let i = 1; i < 6; i++) {
            const funderConnectedContract = fundMe.connect(accounts[i]);
            await funderConnectedContract.fund({value: sendValue});
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
          const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

          // act ------------------------------------
          const txResponse = await fundMe.cheaperWithdraw();
          const txReceipt = await txResponse.wait(1);
          const {gasUsed, effectiveGasPrice} = txReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMebalance = await fundMe.provider.getBalance(fundMe.address); // could use ethers.provider instead
          const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

          // assert ---------------------------------
          assert.equal(endingFundMebalance.toString(), '0');
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(
              (await fundMe.getAddressToAmountFunded(accounts[i].address)).toString(),
              '0'
            );
          }
        });
        it('only allows the owner to withdraw', async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          // const attacker = (await ethers.getSigners())[1];

          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.cheaperWithdraw()).to.be.revertedWithCustomError(
            fundMe,
            'FundMe__NotOwner'
          );
        });
      });
    });
