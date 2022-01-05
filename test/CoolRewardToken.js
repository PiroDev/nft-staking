const { expect } = require('chai');

describe('CoolRewardToken contract', () => {
    let Token, token, owner, user1, user2;

    beforeEach(async () => {
        [owner, user1, user2, _] = await ethers.getSigners();
        Token = await ethers.getContractFactory('CoolRewardToken');
        token = await Token.deploy();
    });

    describe('Deployment', () => {
        it('Should set the right owner', async () => {
            expect(await token.owner()).to.equal(owner.address);
        });
        
        it('Should set creator of token as reward mechanism', async () => {
            expect(await token.rewardMechanism()).to.equal(owner.address);
        });
    });

    describe('Set reward mechanism', () => {
        it('Should set provided reward mechanism if caller is owner', async () => {
            await token.setRewardMechanism(user1.address);
            expect(await token.rewardMechanism()).to.equal(user1.address);
        });

        it('Should revert if caller is not owner', async () => {
            await expect(token.connect(user1).setRewardMechanism(user1.address)).to.be.reverted;
        });
    });

    describe('Give reward', () => {
        it('Should give reward if caller is reward mechanism', async () => {
            const rewardMechanism = user1.address;
            const reward = 100;

            await token.setRewardMechanism(rewardMechanism);
            await token.connect(user1).giveReward(user2.address, reward);
            expect(await token.balanceOf(user2.address)).to.equal(reward);
        });

        it('Should revert if caller is not reward mechanism', async () => {
            const reward = 100;

            await expect(token.connect(user1).giveReward(user2.address, reward)).to.be.reverted;
        });
    });
});