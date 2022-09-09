// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract L1TestERC20 is ERC20 {
    constructor(string memory _name ,string memory _symbol) ERC20(_name, _symbol) {}

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }
}
