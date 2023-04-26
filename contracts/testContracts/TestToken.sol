//SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";

contract TestToken is ERC20PresetFixedSupply {
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20PresetFixedSupply(_name, _symbol, 1_000_000 ether, msg.sender) {}
}
