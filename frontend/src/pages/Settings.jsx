import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { emergencyRevoke } from "../services/adminService";
import { getApiError } from "../services/errorUtils";

function Settings() {
  const [serialNumbers, setSerialNumbers] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRevoke = async () => {
    const list = serialNumbers
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (list.length === 0) {
      showToast("Masukkan minimal satu serial number.", "error");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await emergencyRevoke(list, reason.trim() || undefined);
      setResult(res?.data ?? null);
      showToast(
        `${res?.data?.revoked ?? list.length} product(s) revoked on-chain.`,
        "success"
      );
      setSerialNumbers("");
      setReason("");
    } catch (err) {
      showToast(getApiError(err).message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
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
            background: toast.type === "success" ? "#22c55e" : "#ef4444",
            boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
            maxWidth: "360px",
          }}
        >
          {toast.message}
        </div>
      )}

      <h1 style={{ marginBottom: "25px", color: "#1e293b" }}>
        System Settings
      </h1>

      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "15px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          maxWidth: "640px",
        }}
      >
        <h2 style={{ color: "#dc2626", marginBottom: "10px" }}>
          Emergency Revoke
        </h2>

        <p style={{ color: "#64748b", marginBottom: "20px" }}>
          Permanently mark compromised product serial numbers as{" "}
          <strong>REVOKED</strong> on-chain. Revoked products display a
          counterfeit warning when scanned. Enter one serial number per line.
        </p>

        <label>Serial Numbers (one per line)</label>
        <textarea
          rows="6"
          value={serialNumbers}
          disabled={loading}
          placeholder={`OIL-PERT-2024-000001\nOIL-PERT-2024-000002`}
          onChange={(e) => setSerialNumbers(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "5px",
            marginBottom: "15px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />

        <label>Reason (optional, audit log)</label>
        <input
          type="text"
          value={reason}
          disabled={loading}
          placeholder="QR stickers stolen before distribution — Batch #B-2024-08"
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "5px",
            marginBottom: "20px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />

        <button
          onClick={handleRevoke}
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#94a3b8" : "#dc2626",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Revoking on-chain…" : "Revoke Products"}
        </button>
      </div>

      {result && (
        <div
          style={{
            background: "#fff",
            marginTop: "30px",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            maxWidth: "640px",
          }}
        >
          <h2 style={{ color: "#1e293b", marginBottom: "20px" }}>
            Last Revoke Result
          </h2>

          <p>
            <strong>Total Revoked:</strong> {result.revoked}
          </p>
          <p style={{ wordBreak: "break-all" }}>
            <strong>Transaction Hash:</strong> {result.txHash}
          </p>

          <details>
            <summary
              style={{
                cursor: "pointer",
                color: "#2563eb",
                fontWeight: "bold",
              }}
            >
              View Revoked Product IDs
            </summary>
            <ul>
              {(result.revokedIds || []).map((id) => (
                <li key={id} style={{ wordBreak: "break-all" }}>
                  {id}
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </AdminLayout>
  );
}

export default Settings;
