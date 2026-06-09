import API from "./api";

/**
 * GET /variants/:id  (public)
 * Response (actual backend): { success, data: { variantId, brand, oilType } }
 * Returns 404 with { error: { code: "VARIANT_NOT_FOUND" } } for unknown ids.
 */
export const getVariant = async (variantId) => {
  const response = await API.get(
    `/variants/${encodeURIComponent(variantId)}`
  );

  return response.data;
};

/**
 * Convenience helper: walks variant ids from 1..totalVariants and returns
 * the list of existing variants. The backend has no "list all" endpoint, so
 * we rely on /stats (totalMasterVariantsOnChain) to know how many exist.
 */
export const listVariants = async (totalVariants) => {
  const ids = Array.from({ length: totalVariants }, (_, i) => i + 1);

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await getVariant(id);
        return res?.data ?? null;
      } catch {
        return null;
      }
    })
  );

  return results.filter(Boolean);
};
