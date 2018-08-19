const Campaign = artifacts.require("./Campaign.sol");
contract('Campaign', (accounts) => {
    let campaign;
    let owner = accounts[0];
    let donor = accounts[1];

    let duration = 20;
    let goal = 3e+18;

    beforeEach('set up contract for each test', async () => {
        //campaign takes sponsor,duration, and goal
        campaign = await Campaign.new(owner,duration,goal);
    });

    describe('Campaign Initialization', async() =>{
        it('should have created a new campaign', async()=>{

            const campaignSponsor = await campaign.sponsor.call();
            const campaignDeadline = await campaign.deadline.call();
            const campaignGoal =  await campaign.goal.call();
            const block = await web3.eth.getBlock("latest");

            assert.equal(campaignSponsor,               owner,                      "Campaign sponsor set incorrectly");
            assert.equal(campaignDeadline.toNumber(),   block.number + duration,    "Campaign deadline set incorrectly");
            assert.equal(campaignGoal.toNumber(),       goal,                       "Campaign goal set incorrectly");
            
        })
    })

    describe('Campaign Running', async() => {
        it('should allow contributions', async()=>{
            const contribution = 1e+18;
            const startFunds = await campaign.fundsRaised.call();

            try {
                await campaign.contribute({
                    value: contribution,
                    from: donor
                })
            } catch (error) {
                assert(error.toString().includes('VM Exception'), error.toString())
            }
            assert.equal(await campaign.fundsRaised.call(), startFunds.toNumber()+contribution, "Contribution failed");
        })


        it('should stop allowing contributions if the goal is reached', async()=>{
            const contribution = 4e+18;
            const startFunds = await campaign.fundsRaised.call();
     

            try {
                await campaign.contribute({
                    value: contribution,
                    from: donor
                })
            } catch (error) {
                assert(error.toString().includes('VM Exception'), error.toString())
            }
            assert.equal(await campaign.fundsRaised.call(), startFunds.toNumber()+contribution, "Contribution failed");
            assert.equal(await campaign.isSuccess.call(), true, "Campaign success malfunction");

            //now try to add more funds
            try {
               lateContribution = await campaign.contribute({
                    value: contribution,
                    from: donor
                })
            } catch (error) {
                //transaction SHOULD error out here b/c it is trying to add funds to a successful campaign
                return true;
            }
            throw new Error("Late contribution was mistakenly allowed")
        })
    })

  describe('Failure Blocks Campaign Contributions', async() => {
    it('should stop allowing contributions if the campaign has failed', async()=>{
        const contribution = 2e+18;
        const startFunds = await campaign.fundsRaised.call();

        try {
            await campaign.contribute({
                value: contribution,
                from: donor
            })
        } catch (error) {
            assert(error.toString().includes('VM Exception'), error.toString())
        }
        assert.equal(await campaign.fundsRaised.call(), startFunds.toNumber()+contribution, "Contribution failed");
        assert.equal(await campaign.isSuccess.call(), false, "Campaign success malfunction");


        // emulate blocks 

        for(var i = 0; i<60;i++){
            web3.currentProvider.sendAsync({
                jsonrpc: "2.0",
                method: "evm_mine",
                id: 12345+i
              }, function(err, result) {
              });

            }
        //now try to add more funds after deadline passed
        try {
            await campaign.contribute({
                value: contribution,
                from: donor
            })
        } catch (error) {
            //transaction SHOULD error out here b/c it is trying to add funds to a failed campaign
            return true;
        }
        throw new Error("Contribution after failure was mistakenly allowed")
    })

});

    describe('Campaign Success Status', async() => {

        it('should set isSuccess to false if funds raised do not reach the goal', async() =>{
            const contribution = 1e+18;
            const startFunds = await campaign.fundsRaised.call();

            try {
                await campaign.contribute({
                    value: contribution,
                    from: donor
                })
            } catch (error) {
                assert(error.toString().includes('VM Exception'), error.toString())

            }
            assert.equal(await campaign.isSuccess.call(), false, "Campaign success not flagged correctly");
            
        });

        it('should set isSuccess to true if funds raised reach the goal', async() =>{
            const contribution = 4e+18;
            const startFunds = await campaign.fundsRaised.call();

            try {
                await campaign.contribute({
                    value: contribution,
                    from: donor
                })
            } catch (error) {
                assert(error.toString().includes('VM Exception'), error.toString())
            }
            assert.equal(await campaign.isSuccess.call(), true, "Campaign success not flagged correctly");
        });
    })
 
    describe('Campaign Misses Deadline', async() => {
        it('should set isFailed to true if the deadline is reached without meeting the goal', async()=>{
  
            const contribution = 2e+18;
            const startFunds = await campaign.fundsRaised.call();
            const block = await web3.eth.getBlock("latest");

            try {
                await campaign.contribute({
                    value: contribution,
                    from: donor
                })
            } catch (error) {
                assert(error.toString().includes('VM Exception'), error.toString())
            }

            for(var i = 0; i<50;i++){
                web3.currentProvider.sendAsync({
                    jsonrpc: "2.0",
                    method: "evm_mine",
                    id: 12345+i
                  }, function(err, result) {
                  });

                }
           assert.equal(await campaign.hasFailed.call(), true, "Campaign has not triggered failure correctly");
        })

    });

     describe('Campaign Makes Deadline', async() => {
        it('should set isFailed to false if the deadline is and goal is met', async()=>{
  
            const contribution = 5e+18;
            const startFunds = await campaign.fundsRaised.call();
            const block = await web3.eth.getBlock("latest");

            try {
                await campaign.contribute({
                    value: contribution,
                    from: donor
                })
            } catch (error) {
                assert(error.toString().includes('VM Exception'), error.toString())
            }

            for(var i = 0; i<50;i++){
                web3.currentProvider.sendAsync({
                    jsonrpc: "2.0",
                    method: "evm_mine",
                    id: 12345+i
                  }, function(err, result) {
                  });

                }
                assert.equal(await campaign.hasFailed.call(), false, "Campaign has not triggered failure correctly");
        })
    });

});
