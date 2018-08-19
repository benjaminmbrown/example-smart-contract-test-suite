var Hub = artifacts.require("./Hub.sol");
var Campaign = artifacts.require("./Campaign.sol");
var Owned = artifacts.require("./Owned.sol");
var Stoppable = artifacts.require("./Stoppable.sol");

module.exports = function(deployer,network,accounts){
    deployer.deploy(Owned);
    deployer.link(Owned,Stoppable);
    deployer.deploy(Stoppable);
    deployer.link(Stoppable,Campaign);
    deployer.link(Owned,Campaign);
    deployer.deploy(Campaign,accounts[0],20,3e+18);
    deployer.link(Owned, Hub);
    deployer.link(Stoppable, Hub);
    deployer.link(Campaign, Hub);
    deployer.deploy(Hub);
}