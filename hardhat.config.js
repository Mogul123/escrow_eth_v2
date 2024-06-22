/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter")
module.exports = {
  solidity: "0.8.24",
  gasReporter: {
    currency: "USD",
    L1: "ethereum",
    coinmarketcap: "3ce02817-a7ff-4896-83f4-66ae7021ab22",
    enabled: false,
  }
};
