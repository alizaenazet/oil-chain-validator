import API from "./api";

/**
 * POST /auth/login
 * Backend hardcodes credentials: username "admin" / password "adminoilchain".
 * Response shape (actual backend): { success: true, token: "Bearer <jwt>" }
 *
 * We strip the leading "Bearer " before returning so the axios interceptor can
 * safely prepend it to the Authorization header.
 */
export const login = async (username, password) => {
  const response = await API.post("/auth/login", {
    username,
    password,
  });

  const { token } = response.data;
  const normalizedToken =
    typeof token === "string" ? token.replace(/^Bearer\s+/i, "") : token;

  return { ...response.data, token: normalizedToken };
};
