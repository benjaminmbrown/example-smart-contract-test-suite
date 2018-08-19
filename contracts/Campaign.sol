//////////////////////////////////////////////////////////
// For training purposes only.
// Not suitable for actual use.
// WARNING: This code includes intentional errors.
//////////////////////////////////////////////////////////

pragma solidity ^0.4.18;

import "./Stoppable.sol";

contract Campaign is Stoppable {
 
    address public sponsor;
    uint    public deadline;
    uint    public goal;
    uint    public fundsRaised;
    uint    public refunded;
    
    struct FunderStruct {
        uint amountContributed;
        uint amountRefunded;
    }
    
    mapping (address => FunderStruct) public funderStructs;
    
    modifier onlySponsor { 
        require(msg.sender == sponsor, "not a sponsor");
        _; 
    }
    
    event LogContribution(address sender, uint amount);
    event LogRefundSent(address funder, uint amount);
    event LogWithdrawal(address beneficiary, uint amount);
    
    constructor (address campaignSponsor, uint campaignDuration, uint campaignGoal) public {
        sponsor = campaignSponsor;
        deadline = block.number + campaignDuration;
        goal = campaignGoal;
    }
    
    function isSuccess()
        public
        view
        returns(bool isIndeed)
    {
        return(fundsRaised >= goal);
    }
    
    function hasFailed()
        public
        view
        returns(bool hasIndeed)
    {
        return(fundsRaised < goal && block.number > deadline);
    }
    
    function contribute() 
        public
        onlyIfRunning
        payable 
        returns(bool success) 
    {
        require(msg.value > 0,  "msg.value is not greater than zero");
        require(!isSuccess(),  "campaign is already a success");
        require(!hasFailed(), "campaign has failed already");
        
        if(funderStructs[msg.sender].amountContributed > 0) {
            FunderStruct storage funderStruct = funderStructs[msg.sender];
            funderStruct.amountContributed += msg.value;
        } else {
            funderStruct.amountContributed = msg.value;
            funderStruct.amountRefunded = 0;
        }
        
        fundsRaised += msg.value;
        funderStructs[msg.sender].amountContributed += msg.value;
        emit LogContribution(msg.sender, msg.value);
        return true;
    }
    
    function withdrawFunds() 
        public
        onlySponsor
        onlyIfRunning
        returns(bool success) 
    {
        require(isSuccess(), "campaign not successful");
        
        uint amount = address(this).balance;
        refunded += amount;
        owner.transfer(amount);
        emit LogWithdrawal(owner, amount);
        return true;
    }
    
    function requestRefund()
        public
        onlyIfRunning
        returns(bool success) 
    {
        uint amountOwed = funderStructs[msg.sender].amountContributed - funderStructs[msg.sender].amountRefunded;
        require(amountOwed > 0, "there is no amount owed");
        require(hasFailed(), "the campaign did not fail");
        
        funderStructs[msg.sender].amountRefunded += amountOwed;
        msg.sender.transfer(amountOwed);
        emit LogRefundSent(msg.sender, amountOwed);
        return true;
    }
    
}