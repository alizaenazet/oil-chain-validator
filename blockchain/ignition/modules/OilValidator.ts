import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * @title OilValidator Deployment Module
 * @notice Hardhat Ignition module for deploying the OilValidator contract
 */
export default buildModule("OilValidatorModule", (m) => {
  const validator = m.contract("OilValidator");
  return { validator };
});
