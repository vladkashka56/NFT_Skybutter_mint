// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Food is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000_000_000 ether;
    uint256 public constant RESERVED_FOR_POOL_SUPPLY = 50_000_000_000_000 ether;
    uint256 public constant HOLDER_SUPPLY = 50_000_000_000_000 ether;

    address public constant ECOSYSTEM_ADDRESS = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;

    uint256 public _holderClaimed;
    address public _claimer;

    constructor() ERC20("SwarmFood", "FOOD") {
        require(MAX_SUPPLY == HOLDER_SUPPLY + RESERVED_FOR_POOL_SUPPLY);

        _mint(ECOSYSTEM_ADDRESS, RESERVED_FOR_POOL_SUPPLY);
    }

    function holderClaim(address holder, uint256 amount) external {
        require(_claimer == msg.sender, "SwarmGas: Not Claimer");
        require(_holderClaimed + amount <= HOLDER_SUPPLY, "SwarmGas: Exceed supply");
        _holderClaimed += amount;
        _mint(holder, amount);
    }

    function sweepRestHolderShares() external onlyOwner {
        uint256 rest = HOLDER_SUPPLY - _holderClaimed;
        if (rest > 0) {
            _mint(ECOSYSTEM_ADDRESS, rest);
        }
    }

    function setClaimer(address claimer) external onlyOwner {
        _claimer = claimer;
    }
}