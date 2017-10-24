const fs = require('fs');
const contractFile = JSON.parse(fs.readFileSync('../solidity/build/contracts/Tufa.json', 'utf8'));
const networks = contractFile.networks;
exports.contractAddress = networks[Object.keys(networks)[0]].address; 
exports.contractABI = contractFile.abi;