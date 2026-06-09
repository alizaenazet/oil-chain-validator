// frontend/src/services/variantService.js
import API from "./api";

export const getVariant = async (variantId) => {
  const response = await API.get(`/variants/${encodeURIComponent(variantId)}`);
  return response.data;
};

// 🔥 Ubah listVariants agar langsung menembak rute GET /variants SQLite utuh
export const listVariants = async () => {
  try {
    const response = await API.get("/variants");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching list variants:", error);
    throw error;
  }
};