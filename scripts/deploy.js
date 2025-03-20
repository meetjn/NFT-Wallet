const hre = require("hardhat");

async function main() {
  // Get the deployer account from Hardhat's local accounts
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance));

  // Define owners and threshold. These could be hard-coded or come from user input.
  const owners = [
    deployer.address,
    "0xAbC123...SecondOwner",   // Replace with an actual local account address if needed
    "0xDef456...ThirdOwner"      // Replace with an actual local account address if needed
  ];
  const threshold = 2; // Example: require 2 approvals

  // Get the contract factory for your MultiSigWallet
  const MultiSigWallet = await hre.ethers.getContractFactory("MultiSigWallet");

  // Deploy the contract
  const multisig = await MultiSigWallet.deploy(owners, threshold);
  await multisig.deployed();

  console.log("MultiSigWallet deployed to:", multisig.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
