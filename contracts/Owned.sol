pragma solidity ^0.4.18;

contract Owned {
    
    address public owner;
    
    event LogNewOwner(address sender, address oldOwner, address newOwner);
    
    modifier onlyOwner { 
        require(msg.sender == owner, "not owner");
        _; 
    }
    
    constructor() public {
        owner = msg.sender;
    }
    
    function changeOwner(address newOwner)
        public
        onlyOwner
        returns(bool success)
    {
        emit LogNewOwner(msg.sender, owner, newOwner);
        owner = newOwner;
        return true;
    }
    
}