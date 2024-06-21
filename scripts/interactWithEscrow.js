const { ethers } = require("ethers");

async function main() {
  // Connect to the local Hardhat network

  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
  const [alice, bob, arbitrator] = await Promise.all([
    provider.getSigner("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"), // Replace with Alice's address
    provider.getSigner("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"), // Replace with Bob's address
    provider.getSigner("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"), // Replace with Arbitrator's address
  ]);

  // Load the wallet to deploy the contract
  //const wallet = new ethers.Wallet("<private_key>", provider); // Replace <private_key> with your private key

  // Contract ABI (JSON interface)
  const abi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "_bob",
          type: "address",
        },
        {
          internalType: "address",
          name: "_alice",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "_bobExpectedAmount",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_aliceExpectedAmount",
          type: "uint256",
        },
      ],
      name: "newAgreement",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
      ],
      name: "deposit",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
      ],
      name: "refund",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_id",
          type: "uint256",
        },
      ],
      name: "complete",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "index",
          type: "uint256",
        },
      ],
      name: "getAgreement",
      outputs: [
        {
          name: "bob",
          type: "address",
        },
        {
          name: "alice",
          type: "address",
        },
        {
          name: "arbitrator",
          type: "address",
        },
        {
          name: "bobExpectedAmount",
          type: "uint256",
        },
        {
          name: "aliceExpectedAmount",
          type: "uint256",
        },
        {
          name: "bobIn",
          type: "bool",
        },
        {
          name: "aliceIn",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ];

  // Contract address of deployed Escrow contract
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address

  // Connect to the deployed contract
  const escrowContract = new ethers.Contract(contractAddress, abi, alice);

  // Example usage:
  const bobAddress = bob.address; // Replace with Bob's address
  const aliceAddress = alice.address; // Replace with Alice's address
  const bobExpectedAmount = ethers.parseEther("100");
  const aliceExpectedAmount = ethers.parseEther("50");

  // Create a new agreement
  const agreement = await escrowContract.newAgreement(
    bobAddress,
    aliceAddress,
    bobExpectedAmount,
    aliceExpectedAmount
  );
  //console.log("New agreement created with ID:", agreementId);

  const agreementId = agreement.hash;

  console.log(
    "Bobs Balance BEFORE tx: ",
    ethers.formatEther(await provider.getBalance(bobAddress))
  );
  console.log(
    "Alices Balance BEFORE tx: ",
    ethers.formatEther(await provider.getBalance(aliceAddress))
  );

  // Deposit funds into the agreement (Bob)
  await escrowContract.deposit(agreementId, { value: aliceExpectedAmount });
  console.log("Bob deposited funds into the agreement");

  // Deposit funds into the agreement (Alice)
  await escrowContract.deposit(agreementId, { value: bobExpectedAmount });
  console.log("Alice deposited funds into the agreement");
  console.log("Agreement ID:", agreementId);

  const createdAgreement = await escrowContract.getAgreement(agreementId);

  //console.log("Created agreements NUMBER: ", createdAgreement.length());

  // Complete the agreement (Arbitrator)
  const completeTx = await escrowContract.complete(agreementId);
  await completeTx.wait();

  console.log(
    "Bobs Balance AFTER tx: ",
    ethers.formatEther(await provider.getBalance(bobAddress))
  );
  console.log(
    "Alices Balance AFTER tx: ",
    ethers.formatEther(await provider.getBalance(aliceAddress))
  );

  console.log("Escrow interactions completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
