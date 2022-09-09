
```bash 
export L1_BRIDGE_ADDRESS=0x610178dA211FEF7D417bC0e6FeD39F05609AD788
export L2_BRIDGE_ADDRESS=0x4200000000000000000000000000000000000010

export L1_BIT_TOKEN=0x59b670e9fA9D0A427751Af201D676719a970857b
export L2_BIT_TOKEN=0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000

export ETH10=10000000000000000000
export ETH1000=1000000000000000000000
export ADMIN=0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f

# bit 
yarn hardhat mintL1BitToken --token $L1_BIT_TOKEN --amount $ETH1000 --network l1 
yarn hardhat queryErc20balances --token $L1_BIT_TOKEN --user $ADMIN --network l1 
yarn hardhat queryErc20Allowance --token $L1_BIT_TOKEN --owner $ADMIN --spender $L1_BRIDGE_ADDRESS --network l1 

yarn hardhat depositERC20 --l1sb $L1_BRIDGE_ADDRESS --l1token $L1_BIT_TOKEN --l2token $L2_BIT_TOKEN --amount $ETH10 --l2gas 3000000 --data 0x1 --network l1

# erc20
yarn hardhat deployL1Token --name L1_TEST --symbol l1Test --network l1
export L1_ERC20_TOKEN=0x7662f69f09389d833576e2c3c598ed2c8458b227

yarn hardhat deployL2Token --bridge $L2_BRIDGE_ADDRESS --l1token $L1_ERC20_TOKEN --name L2_TEST --symbol l2Test --network l2
export L2_ERC20_TOKEN=0xc05f51b43e2638ea288b25ab7af3bf898b314340

yarn hardhat mintL1Token --token $L1_ERC20_TOKEN --amount $ETH10  --to $ADMIN --network l1

yarn hardhat depositERC20 --l1sb $L1_BRIDGE_ADDRESS --l1token $L1_ERC20_TOKEN --l2token $L2_ERC20_TOKEN --amount $ETH10 --l2gas 3000000 --data 0x1 --network l1

yarn hardhat queryErc20balances --token $L1_ERC20_TOKEN --user $ADMIN --network l1

yarn hardhat queryErc20balances --token $L2_ERC20_TOKEN --user $ADMIN --network l2

yarn hardhat withdrawERC20 --l2sb $L2_BRIDGE_ADDRESS --l2token $L2_ERC20_TOKEN --amount $ETH10 --network l2
```