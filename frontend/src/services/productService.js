import API from "./api";

/**
 * GET /products/:serialNumber  (public)
 * Response: {
 *   success,
 *   data: {
 *     productId, serialNumber, variantId,
 *     registeredAt, validatedAt, status, lastScanLocation
 *   }
 * }
 * status ∈ "NEW" | "VALIDATED" | "REVOKED"
 */
export const getProduct = async (serialNumber) => {
  const response = await API.get(
    `/products/${encodeURIComponent(serialNumber)}`
  );

  return response.data;
};

/**
 * POST /validate/:serialNumber  (public)
 * Body: { scanLocation }
 * Success (200): { success, message, data: { txHash, previousStatus, currentStatus } }
 * Revoked (409): { success: false, data: { status: "REVOKED", alert } }
 * Not found (404): { success: false, error: { code: "PRODUCT_NOT_FOUND" } }
 */
export const validateProduct = async (serialNumber, scanLocation) => {
  const response = await API.post(
    `/validate/${encodeURIComponent(serialNumber)}`,
    { scanLocation }
  );

  return response.data;
};
