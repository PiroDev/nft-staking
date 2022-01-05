# NFT Staking
Implementation of NFT staking system using Solidity (0.8) and Hardhat.

Staking system consists of 3 parts:
1. **CoolRewardToken** contract: implementation of ERC20 token used as reward token for staking system.
2. **CoolNFT** contract: implementation of ERC721 token which could be aquired with CoolRewardToken-s.
3. **CoolNFTStaking** contract: implementation of NFT staking mechanism using CoolNFT-s as stakes and CoolRewardToken-s as reward.
