pragma solidity ^0.8.0;

// SPDX-License-Identifier: Unlicensed

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import './IRewardToken.sol';

contract CoolNFTStaking {
    using SafeMath for uint256;

    struct Staker {
        mapping (uint => bool) staked;
        uint stakeSize;
        uint unclaimedRewards;
        uint lastRewardsUpdateTime;
    }

    IRewardToken public rewardToken;
    IERC721 public stakableNFT;
    mapping(address => Staker) public stakers;
    uint public totalStakes;
    bytes4 private constant ERC721_RECEIVED = 0x150b7a02;

    constructor(IRewardToken _rewardToken, IERC721 _stakableNFT) {
        rewardToken = _rewardToken;
        stakableNFT = _stakableNFT;
        totalStakes = 0;
    }

    function stake(uint nftId) external {
        // Also checks if nft is already staked
        require(stakableNFT.ownerOf(nftId) == msg.sender, 'Caller must be the owner of staking NFT');
        _updateRewards(msg.sender);

        Staker storage staker = stakers[msg.sender];
        stakableNFT.safeTransferFrom(msg.sender, address(this), nftId);
        staker.stakeSize++;
        totalStakes++;
        staker.staked[nftId] = true;
    }

    function unstake(uint nftId) external {
        Staker storage staker = stakers[msg.sender];        
        require(staker.staked[nftId], 'NFT must be staked by caller');

        _updateRewards(msg.sender);
        stakableNFT.safeTransferFrom(address(this), msg.sender, nftId);
        staker.staked[nftId] = false;
        staker.stakeSize--;
        totalStakes--;
    }

    function claimRewards() external {
        _updateRewards(msg.sender);
        Staker storage staker = stakers[msg.sender];

        if (staker.unclaimedRewards > 0) {
            rewardToken.giveReward(msg.sender, staker.unclaimedRewards);
            staker.unclaimedRewards = 0;
        }
    }

    function _updateRewards(address stakerAddr) internal {
        Staker storage staker = stakers[stakerAddr];

        uint stakingTimeDelta = block.timestamp.sub(staker.lastRewardsUpdateTime);
        uint reward = calcRewards(staker.stakeSize, stakingTimeDelta);
        staker.unclaimedRewards = staker.unclaimedRewards.add(reward);
        staker.lastRewardsUpdateTime = block.timestamp;
    }

    // reward = (hours * stakeSize) tokens per hour
    function calcRewards(uint stakeSize, uint stakingTimeDelta) public pure returns(uint reward) {
        return stakingTimeDelta.div(60 * 60).mul(stakeSize);
    }

    function onERC721Received(address, address, uint256, bytes calldata) public pure returns(bytes4) {
        return ERC721_RECEIVED;
    }
}