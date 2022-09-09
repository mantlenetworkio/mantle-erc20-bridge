const ethers = require('ethers')

const l1factory = (name, type = '', bvm = false) => {
  const artifact = require(`../artifacts/contracts/ERC20${type == '' ? '' : '/' + type}/${name}.sol/${name}.json`)
  return new ethers.ContractFactory(artifact.abi, artifact.bytecode)
}
const factory__L1_ERC20 = l1factory('L1TestERC20')
const factory__L2_ERC20 = l1factory('L2StandardERC20')

const l1bridge = process.env.L1_BRIDGE || '0x610178dA211FEF7D417bC0e6FeD39F05609AD788'
const key = process.env.PRIV_KEY || 'dbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97'

async function main() {
  const l1RpcProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:9545')
  const l2RpcProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

  const l1Wallet = new ethers.Wallet(key, l1RpcProvider)
  const l2Wallet = new ethers.Wallet(key, l2RpcProvider)

  const l2bridge = '0x4200000000000000000000000000000000000010'

  console.log("#################### deposit & withdraw same decimal ####################")
  console.log('Deploying L1 ERC20...')
  const L1_ERC20 = await factory__L1_ERC20.connect(l1Wallet).deploy(
    'L1 ERC20 ExampleToken',
    'L1EPT'
  )
  await L1_ERC20.deployTransaction.wait()
  console.log("L1 ERC20 Contract ExampleToken Address: ", L1_ERC20.address)

  let amount = ethers.utils.parseEther("10")
  await L1_ERC20.connect(l1Wallet).mint(l1Wallet.address, amount)
  balance = (await L1_ERC20.connect(l1Wallet).balanceOf(l1Wallet.address)).toString()
  console.log("mint to ", l1Wallet.address, balance, " success")

  await L1_ERC20.connect(l1Wallet).approve(l1bridge, amount)
  let allowance = await L1_ERC20.connect(l1Wallet).allowance(l1Wallet.address, l1bridge)
  console.log("allowance: ", allowance.toString())

  console.log('Deploying L2 ERC20...')
  const L2_ERC20 = await factory__L2_ERC20.connect(l2Wallet).deploy(
    l2bridge,
    L1_ERC20.address,
    'L2 ERC20 ExampleToken',
    'L2EPT',
  )
  await L2_ERC20.deployTransaction.wait()
  console.log("L2 ERC20 Contract BVM_L2DepositedERC20 Address: ", L2_ERC20.address)

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

  balance = (await L2_ERC20.connect(l2Wallet).balanceOf(l2Wallet.address)).toString()
  console.log("before deposit the balance is : ", balance)
  let l1StandardBridge = new ethers.BaseContract(l1bridge, abi);
  let res = await l1StandardBridge.connect(l1Wallet).depositERC20(L1_ERC20.address, L2_ERC20.address, amount, 300000, ethers.BigNumber.from('0x1'))
  console.log(res)
  console.log("wait for 5s")
  await new Promise(r => setTimeout(r, 5_000));
  balance = (await L2_ERC20.connect(l2Wallet).balanceOf(l2Wallet.address)).toString()
  console.log("after deposit the balance is : ", balance)

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
  balance = (await L1_ERC20.connect(l1Wallet).balanceOf(l2Wallet.address)).toString()
  console.log("before withdraw the l1 balance is : ", balance)

  let l2StandardBridge = new ethers.BaseContract(l2bridge, withdrawAbi);
  res = await l2StandardBridge.connect(l2Wallet).withdraw(L2_ERC20.address, amount, 30000000, ethers.BigNumber.from('0x1'))
  console.log(res)
  console.log("wait for 5s")
  await new Promise(r => setTimeout(r, 5_000));
  balance = (await L1_ERC20.connect(l1Wallet).balanceOf(l2Wallet.address)).toString()
  console.log("after withdraw the l1 balance is : ", balance)  
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
