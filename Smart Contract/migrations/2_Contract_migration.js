var BJJ = artifacts.require("./BJJ.sol");
var Verifier = artifacts.require("./Verifier.sol");
var VoteContainer = artifacts.require("./VoteContainer.sol");

module.exports = function(deployer) {
  // deployer.deploy(BJJ);
  // deployer.deploy(Verifier);
  deployer.deploy(VoteContainer);
};
