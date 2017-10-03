pragma solidity ^0.4.11;

import "./Owned.sol";
import "./TokenERC.sol";

contract AnujToken is Owned, TokenERC {

    uint256 public sellPrice;
    uint256 public buyPrice;

    mapping (address => bool) public frozenAccount;

    event FrozenFunds(address target, bool frozen);
    event BuyTokens(address purchaser, uint tokens);


    function AnujToken(
        uint256 initialSupply,
        string tokenName,
        string tokenSymbol,
        uint _sellPrice,
        uint _buyPrice
    ) TokenERC(initialSupply, tokenName, tokenSymbol) public {
        sellPrice = _sellPrice;
        buyPrice = _buyPrice;
    }

    function _transfer(address _from, address _to, uint _value) internal {
        require (_to != 0x0);                               
        require (balanceOf[_from] > _value);                
        require (balanceOf[_to] + _value > balanceOf[_to]); 
        require(!frozenAccount[_from]);                     
        require(!frozenAccount[_to]);          
        balanceOf[_from] -= _value;                         
        balanceOf[_to] += _value;                           
        Transfer(_from, _to, _value);
    }

   
   
    function freezeAccount(address target, bool freeze) onlyOwner public {
        frozenAccount[target] = freeze;
        FrozenFunds(target, freeze);
    }

   
    function setPrices(uint256 newSellPrice, uint256 newBuyPrice) onlyOwner public {
        sellPrice = newSellPrice;
        buyPrice = newBuyPrice;
    }

    
    function buy() payable public {
        uint amount = msg.value / buyPrice;            
        _transfer(owner, msg.sender, amount);
        BuyTokens(msg.sender, amount);                 
    }

    
    function sell(uint256 amount) public {
        require(this.balance >= amount * sellPrice);      
        _transfer(msg.sender, owner, amount);             
        msg.sender.transfer(amount * sellPrice);        
    }
}
