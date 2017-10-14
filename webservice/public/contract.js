const contractAddress = '0xb1e711db029fdf20ba0b677ef053776d4a97f9b2';

const contractABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "verifier",
        "type": "address"
      },
      {
        "name": "proover",
        "type": "address"
      }
    ],
    "name": "getAuthenticationToken",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "verifier",
        "type": "address"
      },
      {
        "name": "authenticationToken",
        "type": "uint256"
      }
    ],
    "name": "authenticate",
    "outputs": [],
    "payable": false,
    "type": "function"
  }
];