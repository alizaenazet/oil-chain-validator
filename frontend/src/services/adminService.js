import API from "./api";

/**
 * POST /admin/variants  (protected)
 * Body: { brand, oilType }
 * Response: { success, data: { txHash, blockNumber, variant: { brand, oilType } } }
 */
export const addVariant = async (brand, oilType) => {
  const response = await API.post("/admin/variants", {
    brand,
    oilType,
  });

  return response.data;
};

/**
 * POST /admin/batches  (protected)
 * Body: { variantId: number, serialNumbers: string[] }
 * Response: { success, data: { variantId, registered, txHash, productIds } }
 */
export const registerBatch = async (variantId, serialNumbers) => {
  const response = await API.post("/admin/batches", {
    variantId: Number(variantId),
    serialNumbers,
  });

  return response.data;
};

/**
 * POST /admin/transfer-ownership  (protected)
 * Body: { newAdminAddress: string }
 * Response: { success, data: { previousAdmin, newAdmin, txHash, blockNumber } }
 */
export const transferOwnership = async (newAdminAddress) => {
  const response = await API.post("/admin/transfer-ownership", {
    newAdminAddress,
  });

  return response.data;
};

/**
 * POST /admin/emergency-revoke  (protected)
 * Body: { serialNumbers: string[], reason?: string }
 * Response: { success, data: { revoked, txHash, revokedIds } }
 */
export const emergencyRevoke = async (serialNumbers, reason) => {
  const response = await API.post("/admin/emergency-revoke", {
    serialNumbers,
    reason,
  });

  return response.data;
};
