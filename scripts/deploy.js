const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract using ethers.js
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrowInstance = await Escrow.deploy(); // Deploy the contract

  await escrowInstance.waitForDeployment(); // Wait for deployment to be confirmed

  console.log("Escrow deployed to:", escrowInstance.runner.call);
  console.log("Escrow deployed to target:", escrowInstance.target);
  console.log("Escrow instance address:", await escrowInstance.getAddress());
  console.log("Deployed Instance: ", escrowInstance);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
