/**
 * Normalizes an axios error (or any thrown value) into a human-readable
 * message and the backend error code when available.
 *
 * The backend's error envelope is:
 *   { success: false, error: { code, message, ...extra } }
 * Some endpoints (e.g. validate revoked) instead return:
 *   { success: false, data: { status, alert } }
 */
export const getApiError = (error) => {
  const resData = error?.response?.data;

  if (resData?.error) {
    return {
      code: resData.error.code || "ERROR",
      message: resData.error.message || "Request failed.",
      details: resData.error,
    };
  }

  if (resData?.data?.alert) {
    return {
      code: resData.data.status || "ERROR",
      message: resData.data.alert,
      details: resData.data,
    };
  }

  return {
    code: "NETWORK_ERROR",
    message:
      error?.message ||
      "Unable to reach the server. Make sure the backend is running on port 3000.",
    details: null,
  };
};
