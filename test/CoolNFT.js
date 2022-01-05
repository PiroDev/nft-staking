const { expect } = require('chai');

describe('CoolNFT contract', () => {
    let RewardToken, rewardToken, NFT, nft, nftAquireCost, owner, user1, user2;

    beforeEach(async () => {
        [owner, user1, user2, _] = await ethers.getSigners();
        RewardToken = await ethers.getContractFactory('CoolRewardToken');
        rewardToken = await RewardToken.deploy();

        nftAquireCost = 10;
        NFT = await ethers.getContractFactory('CoolNFT');
        nft = await NFT.deploy(rewardToken.address, nftAquireCost);
    });

    describe('Deployment', () => {
        it('Should set the right owner', async () => {
            expect(await nft.owner()).to.equal(owner.address);
        });

        it('Should set the right accepted token', async () => {
            expect(await nft.acceptedToken()).to.equal(rewardToken.address);
        });

        it('Should set the right aquire cost', async () => {
            expect(await nft.aquireCost()).to.equal(nftAquireCost);
        });

        it('Should set token counter to 0', async () => {
            expect(await nft.tokenCounter()).to.equal(0);
        });
    });

    describe('Set aquire cost', async () => {
        let newCost;

        beforeEach(async () => {
            newCost = 100;
        });

        it('Should set aquire cost if caller is owner', async () => {
            await nft.setAquireCost(newCost);
            expect(await nft.aquireCost()).to.equal(newCost);
        });

        it('Should revert if caller is not owner', async () => {
            await expect(nft.connect(user1).setAquireCost(newCost)).to.be.reverted;
        });
    });

    describe('Aquire NFT', async () => {
        let initBalance;

        beforeEach(async () => {
            initBalance = 25;
            await rewardToken.giveReward(user1.address, initBalance);
            await rewardToken.connect(user1).approve(nft.address, nftAquireCost);
        });

        it('Should mint NFT to caller\'s address if balance is sufficient', async () => {
            await nft.connect(user1).aquireCollectable();
            expect(await nft.balanceOf(user1.address)).to.equal(1);
        });

        it('Should transfer tokens from caller to NFT owner if caller\'s balance is sufficient', async () => {
            const callerBalanceAfterAquire = initBalance - nftAquireCost;
            await nft.connect(user1).aquireCollectable();
            expect(await rewardToken.balanceOf(user1.address)).to.equal(callerBalanceAfterAquire);
            expect(await rewardToken.balanceOf(owner.address)).to.equal(nftAquireCost);
        });

        it('Should revert if caller\'s balance is not sufficient', async () => {
            const newAquireCost = 9000;
            await nft.setAquireCost(newAquireCost);
            await expect(nft.connect(user1).aquireCollectable()).to.be.reverted;
        });

        it('Should increase token counter by 1 if token is aquired', async () => {
            await nft.connect(user1).aquireCollectable();
            expect(await nft.tokenCounter()).to.equal(1);
        });

        it('Should emit event if token is aquired', async () => {
            await expect(nft.connect(user1).aquireCollectable()).to.emit(nft, 'CollectableAquired');
        });
    });
});