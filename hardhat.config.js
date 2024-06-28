/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
module.exports = {
  solidity: "0.8.24",
  gasReporter: {
    currency: "USD",
    L1: "ethereum",
    enabled: true,
  }
};
