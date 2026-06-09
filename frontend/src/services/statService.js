import API from "./api";

/**
 * GET /stats  (public)
 * Response (actual backend): { success, data: { totalMasterVariantsOnChain } }
 */
export const getStats = async () => {
  const response = await API.get("/stats");

  return response.data;
};
