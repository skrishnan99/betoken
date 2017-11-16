pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './etherdelta.sol';
import './oraclizeAPI_0.4.sol';

contract GroupFund is usingOraclize {
  using SafeMath for uint256;


  ControlToken cToken;
  address public controlTokenAddr;

  string public priceCheckURL1;
  string public priceCheckURL2;
  string public priceCheckURL3;
  string public priceCheckURL4;
  string public priceCheckURL5;

  uint256 results;

  function GroupFund() {
    priceCheckURL1 = "json(https://min-api.cryptocompare.com/data/price?fsym=";
    priceCheckURL2 = "OMG";
    priceCheckURL3 = "&tsyms=";
    priceCheckURL4 = "ETH";
    priceCheckURL5 = ").ETH";
    results = 0;
  }



  function deposit() payable {
  }



  function foo() {
    cToken = new ControlToken();
    controlTokenAddr = address(cToken);
  }



  function __grabCurrentPriceFromOraclize() public payable {
    string memory urlToQuery = strConcat(priceCheckURL1, priceCheckURL2, priceCheckURL3, priceCheckURL4, priceCheckURL5);
    string memory url = "URL";

    // Call Oraclize to grab the most recent price information via JSON
    oraclize_query(url, urlToQuery);
  }



  // Callback function from Oraclize query:
  function __callback(bytes32 _myID, string _result) public {
    require(msg.sender == oraclize_cbAddress());

    // Grab ETH price in Weis
    uint256 priceInWeis = parseInt(_result, 18);
    results = priceInWeis;
  }
}



contract ControlToken is MintableToken {
  using SafeMath for uint256;
}
