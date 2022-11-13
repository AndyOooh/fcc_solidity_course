import {ethers, getNamedAccounts} from 'hardhat';

const main = async () => {
  const {deployer} = await getNamedAccounts();
  const fundValue = ethers.utils.parseEther('0.5');
  const fundMe = await ethers.getContract('FundMe', deployer);
  console.log('Funding FundMe contract...');
  const transactionResponse = await fundMe.fund({value: fundValue});
  await transactionResponse.wait(1);
  console.log(`Funded FundMe contract with ${fundValue} wei`);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
