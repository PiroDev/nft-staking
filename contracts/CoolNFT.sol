pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract CoolNFT is ERC721, Ownable {
    uint public tokenCounter;
    uint public aquireCost;
    IERC20 public acceptedToken;

    event CollectableAquired(
        address payer,
        uint tokenId,
        uint cost,
        uint date
    );

    constructor(IERC20 _acceptedToken, uint _aquireCost) ERC721('Cool NFT', 'CFT') {
        tokenCounter = 0;
        aquireCost = _aquireCost;
        acceptedToken = _acceptedToken;
    }

    function aquireCollectable() external {
        require(acceptedToken.balanceOf(msg.sender) >= aquireCost, 'Balance must be sufficient');
        
        acceptedToken.transferFrom(msg.sender, owner(), aquireCost);
        _mint(msg.sender, tokenCounter);
        emit CollectableAquired(msg.sender, tokenCounter, aquireCost, block.timestamp);

        tokenCounter++;
    }

    function setAquireCost(uint newCost) external onlyOwner {
        aquireCost = newCost;
    }
}
