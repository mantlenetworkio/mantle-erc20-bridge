const fs = require("fs");
import "@nomiclabs/hardhat-web3";
import { BigNumber } from "ethers";
import { task, types } from "hardhat/config";

task("deployL1Token", "Deploy Token")
  .addParam("name", "token name")
  .addParam("symbol", "token symbol")
  .setAction(async (taskArgs, hre) => {
    const tokenFactory = await hre.ethers.getContractFactory('L1TestERC20')
    const token = await tokenFactory.deploy(taskArgs.name, taskArgs.symbol)
    await token.deployed();
    console.log("export ERC20_TOKEN=%s", token.address.toLocaleLowerCase());
  });

task("deployL2Token", "Deploy Token")
  .addParam("bridge", "token name")
  .addParam("l1token", "token name")
  .addParam("name", "token name")
  .addParam("symbol", "token symbol")
  .setAction(async (taskArgs, hre) => {
    const balance0 = await hre.ethers.provider.getBalance("0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f")
    console.log("balances:", balance0)

    const tokenFactory = await hre.ethers.getContractFactory('L2StandardERC20')
    const token = await tokenFactory.deploy(taskArgs.bridge, taskArgs.l1token, taskArgs.name, taskArgs.symbol)
    await token.deployed();
    console.log("export L2_ERC20_TOKEN=%s", token.address.toLocaleLowerCase());
  });

task("queryL2Params")
  .addParam("token", "erc20 address")
  .setAction(async (taskArgs, hre) => {
    const tokenFactory = await hre.ethers.getContractFactory('L2StandardERC20')
    const token = await tokenFactory.attach(taskArgs.token)

    console.log("l1token : ", await token.l1Token())
    console.log("l2Bridge : ", await token.l2Bridge())
    console.log("name : ", await token.name())
    console.log("symbol : ", await token.symbol())
  });

task("mintL1Token", "Mint Token")
  .addParam("token", "token address")
  .addParam("amount", "token mint amount")
  .addParam("to", "接受者钱包地址")
  .setAction(async (taskArgs, hre) => {
    const tokenFactory = await hre.ethers.getContractFactory('L1TestERC20')
    const token = tokenFactory.attach(taskArgs.token)
    await token.mint(taskArgs.to, taskArgs.amount)
  });

task("mintL1BitToken", "Mint Token")
  .addParam("token", "token address")
  .addParam("amount", "token mint amount")
  .setAction(async (taskArgs, hre) => {
    const tokenFactory = await hre.ethers.getContractFactory('BitTokenERC20')
    const token = await tokenFactory.attach(taskArgs.token)
    await token.mint(taskArgs.amount)
  });

task("queryErc20balances", "Query ERC20 balances")
  .addParam("token", "token address")
  .addParam("user", "user address ")
  .setAction(async (taskArgs, hre) => {
    const tokenFactory = await hre.ethers.getContractFactory('L1TestERC20')
    const token = await tokenFactory.attach(taskArgs.token)
    let balances = (await token.balanceOf(taskArgs.user)).toString()
    console.log(balances)
  });

task("queryErc20Allowance", "Query ERC20 allowance")
  .addParam("token", "token address")
  .addParam("owner", "owner address")
  .addParam("spender", "spender address ")
  .setAction(async (taskArgs, hre) => {
    const tokenFactory = await hre.ethers.getContractFactory('L1TestERC20')
    const token = await tokenFactory.attach(taskArgs.token)
    let allowance = (await token.allowance(taskArgs.owner, taskArgs.spender))
    console.log(allowance)
  });

task("approve", "approve ERC20 token to others")
  .addParam("token", "erc20 address")
  .addParam("to", "to address ")
  .addParam("amount", "approve amount")
  .setAction(async (taskArgs, hre) => {
    const tokenFactory = await hre.ethers.getContractFactory('L1TestERC20')
    const token = await tokenFactory.attach(taskArgs.token)

    await token.approve(taskArgs.to, taskArgs.amount)
  });

task("depositERC20", "Deposit ERC20 (L1 => L2)")
  .addParam("l1sb", "The token's address of Proxy__BVM_L1StandardBridge")
  .addParam("l1token", "The token's address of l1Token")
  .addParam("l2token", "The token's address of l2Token")
  .addParam("amount", "deposit amount", "10000", types.string, true)
  .addParam("l2gas", "l2Gas", 100000, types.int, true)
  .addParam("data", "to l2 messages")
  .setAction(async (taskArgs, hre) => {
    const tokenFactory = await hre.ethers.getContractFactory('L1TestERC20')
    const token = await tokenFactory.attach(taskArgs.l1token)

    console.log(await token.approve(taskArgs.l1sb, taskArgs.amount))
    console.log("approve success")

    let abi = [{
      "inputs": [
        {
          "internalType": "address",
          "name": "_l1Token",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_l2Token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "_l2Gas",
          "type": "uint32"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "depositERC20",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }]

    const l1RpcProvider = new hre.ethers.providers.JsonRpcProvider('http://localhost:9545')
    const l1Wallet = new hre.ethers.Wallet('dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97', l1RpcProvider);
    console.log("spender: ", l1Wallet.address)
    const l1StandardBridge = await hre.ethers.getContractAt(abi, taskArgs.l1sb, l1Wallet)

    const responese = await l1StandardBridge.depositERC20(taskArgs.l1token, taskArgs.l2token, taskArgs.amount, taskArgs.l2gas, BigNumber.from(taskArgs.data))
    console.log("l1StandardBridge depositERC20 responese: ", responese)
  });

task("withdrawERC20")
  .addParam("l2sb", "The token's address of bridge")
  .addParam("l2token", "The token's address of l2Token")
  .addParam("amount", "deposit amount")
  .setAction(async (taskArgs, hre) => {
    let withdrawAbi = [{
      "inputs": [
        {
          "internalType": "address",
          "name": "_l2Token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "_l1Gas",
          "type": "uint32"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "withdraw",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }]
    const l2RpcProvider = new hre.ethers.providers.JsonRpcProvider('http://localhost:8545')
    const l2Wallet = new hre.ethers.Wallet('dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97', l2RpcProvider);
    let l2StandardBridge = new hre.ethers.BaseContract(taskArgs.l2sb, withdrawAbi);

    let res = await l2StandardBridge.connect(l2Wallet).withdraw(taskArgs.l2token, taskArgs.amount, 30000000, BigNumber.from('0x1'))
    console.log(res)
  });