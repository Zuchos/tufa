pragma solidity ^0.4.4;

contract Tufa {

  mapping (address => mapping(address => uint)) authentications;

	function authenticate(address verifier, uint authenticationToken) {
    require(authenticationToken > 0);
    address proover = msg.sender;
    authentications[proover][verifier] = authenticationToken;
	}

  function getAuthenticationToken(address verifier, address proover) constant returns (uint) {
    return authentications[proover][verifier];
  }
}
