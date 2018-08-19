const Hub = artifacts.require("./Hub.sol");
contract('Hub', (accounts) => {
    let hub;
    let owner = accounts[0];
    let donor = accounts[1];
    let createdCampaignAddress;
    beforeEach('set up Hub contract for each test', async () => {
        hub = await Hub.deployed();
    });

    describe('Hub Initialization', async () => {
        it('should start with zero campaigns', async () => {
            const campaignCount = await hub.getCampaignCount.call();
            assert(campaignCount, 0, "Error: hub should have zero campaigns");
        })

        it('should be able to create a campaign', async () => {
            let startCampaignCount =  await hub.getCampaignCount.call();
            let createdCampaign;
            let goal = 15;
            let duration = 30;
            try {
               createdCampaign = await hub.createCampaign(duration,goal,{from: donor})
            } catch (error) {
                assert(error.toString().includes('VM Exception'), error.toString())
            }
            createdCampaignAddress = createdCampaign.logs[0].args.campaign;
            let upadatedCount = await hub.getCampaignCount.call();

            assert.equal(createdCampaign.logs[0].event,                     "LogNewCampaign",    "Campaign creation did not occur")
            assert.equal(createdCampaign.logs[0].args.duration.toNumber(),  duration,            "duration was not set correctly");
            assert.equal(createdCampaign.logs[0].args.goal.toNumber(),      goal,                "goal was not set correctly");
            assert.equal(createdCampaign.logs[0].args.sponsor,              donor,               "Sponsor mismatch");
            assert.equal(await upadatedCount.toNumber(),                    startCampaignCount+1,"Campaign count not updated properly");
        
        });
    });
});