//////////////////////////////////////////////////////////
// For training purposes only.
// Not suitable for actual use.
// WARNING: This code includes intentional errors.
//////////////////////////////////////////////////////////

pragma solidity ^0.4.18; 

import "./Campaign.sol";

contract Hub is Stoppable {
    
    address[] public campaigns;
    mapping(address => bool) campaignExists;
    
    modifier onlyIfCampaign(address campaign) {
        require(campaignExists[campaign], "campaign doesn't exist");
        _;
    }
    
    event LogNewCampaign(address sponsor, address campaign, uint duration, uint goal);
    event LogCampaignStopped(address sender, address campaign);
    event LogCampaignStarted(address sender, address campaign);
    event LogCampaignNewOwner(address sender, address campaign, address newOwner);
    
    function getCampaignCount()
        public
        view
        returns(uint campaignCount)
    {
        return campaigns.length;
    }
    
    function createCampaign(uint campaignDuration, uint campaignGoal)
        public
        returns(address campaignContract)
    {
        Campaign trustedCampaign = new Campaign(msg.sender,campaignDuration, campaignGoal);
        campaigns.push(trustedCampaign);
        campaignExists[trustedCampaign] = true;
        emit LogNewCampaign(msg.sender, trustedCampaign, campaignDuration, campaignGoal);
        return trustedCampaign;
    }
    
    // Pass-through Admin Controls
    
    function stopCampaign(address campaign) 
        public
        onlyOwner
        onlyIfCampaign(campaign)
        returns(bool success)
    {
        Campaign trustedCampaign = Campaign(campaign);
        emit LogCampaignStopped(msg.sender, campaign);
        return(trustedCampaign.runSwitch(false));
    }
    
    function startCampaign(address campaign) 
        public
        onlyOwner
        onlyIfCampaign(campaign)
        returns(bool success)
    {
        Campaign trustedCampaign = Campaign(campaign);
        emit LogCampaignStarted(msg.sender, campaign);
        return(trustedCampaign.runSwitch(true));        
    }
    
    function changeCampaignOwner(address campaign, address newOwner) 
        public onlyOwner
        onlyIfCampaign(campaign)
        returns(bool success)
    {
        Campaign trustedCampaign = Campaign(campaign);
        emit LogCampaignNewOwner(msg.sender, campaign, newOwner);
        return(trustedCampaign.changeOwner(newOwner)); 
    }
    
}