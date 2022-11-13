import {ethers, getNamedAccounts} from 'hardhat';

const main = async () => {
  const {deployer} = await getNamedAccounts();
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log('Withdrawing from FundMe contract...');
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log(`Withdrew funds from FundMe contract `);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
