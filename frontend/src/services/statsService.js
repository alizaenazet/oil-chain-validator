import API from "./api";

export const getStats =
  async () => {
    const response =
      await API.get("/stats");

    return response.data;
  };