pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './IRewardToken.sol';

contract CoolRewardToken is ERC20, IRewardToken, Ownable {
    address public rewardMechanism;

    modifier onlyRewardMechanism() {
        require(msg.sender == rewardMechanism, 'Only reward mechanism is allowed');
        _;
    }

    constructor() ERC20('Cool Reward Token', 'CRT') {
        rewardMechanism = msg.sender;
    }

    function giveReward(address to, uint amount) external override onlyRewardMechanism {
        _mint(to, amount);
    }

    function setRewardMechanism(address newRewardMechanism) external onlyOwner {
        rewardMechanism = newRewardMechanism;
    }
}