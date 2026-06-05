import API from "./api";

export const validateProduct = async (
  serialNumber,
  scanLocation
) => {
  const response = await API.post(
    "/products/validate",
    {
      serialNumber,
      scanLocation,
    }
  );

  return response.data;
};