import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { getApiError } from "../services/errorUtils";

function Login() {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [toast, setToast] =
    useState(null);

  const navigate = useNavigate();

  const showToast = (
    message,
    type
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      showToast(
        "Username dan Password wajib diisi",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const result = await login(username, password);

      if (!result?.token) {
        throw new Error("Token tidak diterima dari server.");
      }

      localStorage.setItem("token", result.token);

      showToast("Login berhasil", "success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      const { message } = getApiError(error);
      showToast(message || "Login gagal", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "14px 20px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "bold",
            zIndex: 999,
            background:
              toast.type === "success"
                ? "#22c55e"
                : "#ef4444",
            boxShadow:
              "0 5px 15px rgba(0,0,0,0.2)",
          }}
        >
          {toast.message}
        </div>
      )}

      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "400px",
          boxShadow:
            "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#1e293b",
            marginBottom: "30px",
          }}
        >
          Admin Login
        </h1>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            disabled={loading}
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border:
                "1px solid #cbd5e1",
              marginBottom: "15px",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            disabled={loading}
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border:
                "1px solid #cbd5e1",
              marginBottom: "20px",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: loading
                ? "#94a3b8"
                : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontWeight: "bold",
            }}
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
