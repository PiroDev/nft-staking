pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

interface IRewardToken {
    function giveReward(address to, uint amount) external;
}
