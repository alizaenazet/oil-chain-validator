import API from "./api";

export const addVariant = async (
  brand,
  oilType
) => {
  const response =
    await API.post(
      "/admin/variants",
      {
        brand,
        oilType,
      }
    );

  return response.data;
};

export const transferOwnership =
  async (
    newAdminAddress
  ) => {
    const response =
      await API.post(
        "/admin/transfer-ownership",
        {
          newAdminAddress,
        }
      );

    return response.data;
  };