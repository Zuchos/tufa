pragma solidity ^0.4.4;

contract Tufa {

   mapping(address => uint) authentications;

	function authenticate(uint authenticationToken) {
    require(authenticationToken > 0);
    address prover = msg.sender;
    authentications[prover] = authenticationToken;
	}

  function getAuthenticationToken(address prover) constant returns (uint) {
    return authentications[prover];
  }
}
