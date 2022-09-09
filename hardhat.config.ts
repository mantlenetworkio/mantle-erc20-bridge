import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/deposit"

module.exports = {
  defaultNetwork: 'hardhat',
  defender: {
      apiKey: "[apiKey]",
      apiSecret: "[apiSecret]",
  },
  networks: {
      hardhat: {
          allowUnlimitedContractSize: true,
      },
      l1: {
        url: "http://localhost:9545",
        chainId: 31337,
        gas: 'auto',
        gasPrice: 'auto',
        accounts:['dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97']
      },
      l2: {
        url: "http://localhost:8545",
        chainId: 17,
        gas: 'auto',
        gasPrice: 'auto',
        accounts:['dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97']
      },
  },
  solidity: {
      version: '0.8.12',
      settings: {
          optimizer: {
              enabled: true,
              runs: 1000,
          },
      }
  },
  gasReporter: {
      enabled: true,
      showMethodSig: true,
      maxMethodDiff: 10,
  },
  contractSizer: {
      alphaSort: true,
      runOnCompile: true,
      disambiguatePaths: false,
  },
  paths: {
      sources: "./contracts",
      tests: "./test",
      cache: "./cache",
      artifacts: "./artifacts"
  },
  abiExporter: {
      path: './abi',
      clear: true,
      spacing: 4,
  }
}