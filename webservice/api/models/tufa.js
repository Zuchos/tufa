module.exports = function (web3) {

  const contract = require('./contract');

  const tufaContract = web3.eth.contract(contract.contractABI).at(contract.contractAddress);
  const tufa = {};
  web3.eth.getAccounts((error, result) => {
    tufa.account = result[4]
    console.log(tufa.account);
  });

  tufa.getAuthenticationToken = proover => new Promise((resolve, reject) => {
    if (!tufa.account || !proover) {
      reject("Problem with accounts...");
    } else {
      try {
        console.log(proover);
        tufaContract.getAuthenticationToken.call(tufa.account, proover, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      } catch (e) {
        reject(e);
      }
    }
  });

  return tufa;
};
