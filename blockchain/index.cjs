const OilValidatorArtifact = require('./artifacts/contracts/OilValidator.sol/OilValidator.json');
const deployedAddresses = require('./ignition/deployments/chain-31337/deployed_addresses.json');

module.exports = {
  abi: OilValidatorArtifact.abi,
  address: deployedAddresses['OilValidatorModule#OilValidator'],
};
