var AnujToken = artifacts.require("./AnujToken.sol");

module.exports = function(deployer) {
  deployer.deploy(AnujToken,1000000,"AnujToken","AT",2,2);
};
