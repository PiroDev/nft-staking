const { expect } = require('chai');

describe('CoolNFTStaking contract', () => {
    let RewardToken, rewardToken, NFT, nft, nftAquireCost, initBalance, owner, user1, user2;

    beforeEach(async () => {
        [owner, user1, user2, _] = await ethers.getSigners();
        RewardToken = await ethers.getContractFactory('CoolRewardToken');
        rewardToken = await RewardToken.deploy();
        initBalance = 15;
        await rewardToken.giveReward(user1.address, initBalance);
        await rewardToken.giveReward(user2.address, initBalance);

        nftAquireCost = 10;
        NFT = await ethers.getContractFactory('CoolNFT');
        nft = await NFT.deploy(rewardToken.address, nftAquireCost);

        await rewardToken.connect(user1).approve(nft.address, nftAquireCost);
        await rewardToken.connect(user2).approve(nft.address, nftAquireCost);
        await nft.connect(user1).aquireCollectable();
        await nft.connect(user2).aquireCollectable();

        Staking = await ethers.getContractFactory('CoolNFTStaking');
        staking = await Staking.deploy(rewardToken.address, nft.address);
        await rewardToken.setRewardMechanism(staking.address);
        await nft.connect(user1).approve(staking.address, 0);
        await nft.connect(user2).approve(staking.address, 1);
    });

    describe('Deployment', () => {
        it('Should set the right reward token', async () => {
            expect(await staking.rewardToken()).to.equal(rewardToken.address);
        });

        it('Should set the right stakable NFT', async () => {
            expect(await staking.stakableNFT()).to.equal(nft.address);
        });

        it('Should set stakes count to 0', async () => {
            expect(await staking.totalStakes()).to.equal(0);
        });
    });

    describe('Staking', () => {
        it('Should transfer NFT to staking contract', async () => {
            await staking.connect(user1).stake(0);
            expect(await nft.ownerOf(0)).to.equal(staking.address);
        });

        it('Should increase user stake size by 1', async () => {
            await staking.connect(user1).stake(0);
            const staker = await staking.stakers(user1.address);
            expect(staker['stakeSize']).to.equal(1);
        });

        it('Should increase total stakes count by 1', async () => {
            await staking.connect(user1).stake(0);
            expect(await staking.totalStakes()).to.equal(1);
        });

        it('Should revert if caller is not the owner of NFT', async () => {
            await expect(staking.connect(user2).stake(0)).to.be.reverted;
        });

        it('Should revert if NFT is already staked', async () => {
            await staking.connect(user1).stake(0);
            await expect(staking.connect(user1).stake(0)).to.be.reverted;
        });
    });

    describe('Unstaking', () => {
        it('Should transfer NFT to caller', async () => {
            await staking.connect(user1).stake(0);
            await staking.connect(user1).unstake(0);
            expect(await nft.ownerOf(0)).to.equal(user1.address);
        });

        it('Should decrease user stake size by 1', async () => {
            await staking.connect(user1).stake(0);
            await staking.connect(user1).unstake(0);
            const staker = await staking.stakers(user1.address);
            expect(staker['stakeSize']).to.equal(0);
        });

        it('Should increase total stakes count by 1', async () => {
            await staking.connect(user1).stake(0);
            await staking.connect(user1).unstake(0);
            expect(await staking.totalStakes()).to.equal(0);
        });

        it('Should revert if NFT is not staked by caller', async () => {
            await expect(staking.connect(user1).unstake(0)).to.be.reverted;
        });
    });

    describe('Rewarding', () => {
        let hours;
        beforeEach(async () => {
            await staking.connect(user1).stake(0);

            hours = 22;
            const timedeltaSeconds = hours * 60 * 60;
            await ethers.provider.send('evm_increaseTime', [timedeltaSeconds]); 
            await ethers.provider.send('evm_mine');
        });

        it('Should transfer properly calculated reward to staker', async () => {
            const balanceBefore = +(await rewardToken.balanceOf(user1.address));
            const expectedReward = balanceBefore + hours * 1;
            await staking.connect(user1).claimRewards();
            expect(await rewardToken.balanceOf(user1.address)).to.equal(expectedReward);
        });
    });
});