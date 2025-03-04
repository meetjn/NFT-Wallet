const { ethers } = require("hardhat");

async function main() {
  try {
    //list of signers (owners)
    const [admin1, admin2, admin3] = await ethers.getSigners();
    
    console.log("Deploying with account:", admin1.address);
    console.log("Account balance:", (await admin1.getBalance()).toString());

    const MultisigFactory = await ethers.getContractFactory("MultiSigWallet");

    const owners = [admin1.address, admin2.address, admin3.address];
    const threshold = 2;

    console.log("Deploying MultiSig Wallet contract...");
    console.log("Owners:", owners);
    console.log("Threshold:", threshold);

    const multisig = await MultisigFactory.deploy(owners, threshold);
    
    // Waitin for deployment to complete
    await multisig.deployed();
    
    console.log("\nDeployment successful!");
    console.log("MultiSig Wallet address:", multisig.address);
    console.log("Deployed by:", admin1.address);

    // Additional verification
    const contractThreshold = await multisig.threshold();
    console.log("\nVerifying contract state:");
    console.log("Configured threshold:", contractThreshold.toString());
    
    // Verifyin 
    const isOwner = await multisig.isOwner(owners[0]);
    console.log("First owner verification:", isOwner);

  } catch (error) {
    console.error("\nDeployment failed!");
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Runnin the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });