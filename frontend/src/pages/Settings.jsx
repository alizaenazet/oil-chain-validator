import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { emergencyRevoke, transferOwnership } from "../services/adminService";
import { getApiError } from "../services/errorUtils";

function Settings() {
  const [serialNumbers, setSerialNumbers] = useState("");
  const [reason, setReason] = useState("");
  const [newAdminAddress, setNewAdminAddress] = useState("");

  const [loadingRevoke, setLoadingRevoke] = useState(false);
  const [loadingTransfer, setLoadingTransfer] = useState(false);

  const [toast, setToast] = useState(null);
  const [revokeResult, setRevokeResult] = useState(null);
  const [transferResult, setTransferResult] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleTransfer = async () => {
    const addr = newAdminAddress.trim();
    if (!addr) {
      showToast("Masukkan alamat wallet tujuan.", "error");
      return;
    }

    setLoadingTransfer(true);
    setTransferResult(null);
    try {
      const res = await transferOwnership(addr);
      setTransferResult(res?.data ?? null);
      showToast(
        `Ownership transferred to ${addr.slice(0, 8)}…${addr.slice(-6)}`,
        "success"
      );
      setNewAdminAddress("");
    } catch (err) {
      showToast(getApiError(err).message, "error");
    } finally {
      setLoadingTransfer(false);
    }
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

    setLoadingRevoke(true);
    setRevokeResult(null);
    try {
      const res = await emergencyRevoke(list, reason.trim() || undefined);
      setRevokeResult(res?.data ?? null);
      showToast(
        `${res?.data?.revoked ?? list.length} product(s) revoked on-chain.`,
        "success"
      );
      setSerialNumbers("");
      setReason("");
    } catch (err) {
      showToast(getApiError(err).message, "error");
    } finally {
      setLoadingRevoke(false);
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
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "25px",
        }}
      >
        {/* Transfer Ownership */}
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ color: "#2563eb", marginBottom: "10px" }}>
            Transfer Ownership
          </h2>

          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            Transfer contract administrator rights to another wallet address
            on-chain.
          </p>

          <input
            type="text"
            placeholder="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            value={newAdminAddress}
            disabled={loadingTransfer}
            onChange={(e) => setNewAdminAddress(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              marginBottom: "15px",
            }}
          />

          <button
            onClick={handleTransfer}
            disabled={loadingTransfer}
            style={{
              width: "100%",
              background: loadingTransfer ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "10px",
              cursor: loadingTransfer ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {loadingTransfer ? "Transferring on-chain…" : "Transfer Ownership"}
          </button>
        </div>

        {/* Emergency Revoke */}
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
            rows="4"
            value={serialNumbers}
            disabled={loadingRevoke}
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
            disabled={loadingRevoke}
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
            disabled={loadingRevoke}
            style={{
              width: "100%",
              background: loadingRevoke ? "#94a3b8" : "#dc2626",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "10px",
              cursor: loadingRevoke ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            {loadingRevoke ? "Revoking on-chain…" : "Revoke Products"}
          </button>
        </div>
      </div>

      {transferResult && (
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
            Last Ownership Transfer
          </h2>

          <p style={{ wordBreak: "break-all" }}>
            <strong>Previous Admin:</strong> {transferResult.previousAdmin}
          </p>
          <p style={{ wordBreak: "break-all" }}>
            <strong>New Admin:</strong> {transferResult.newAdmin}
          </p>
          <p style={{ wordBreak: "break-all" }}>
            <strong>Transaction Hash:</strong> {transferResult.txHash}
          </p>
          <p>
            <strong>Block Number:</strong> {transferResult.blockNumber}
          </p>
        </div>
      )}

      {revokeResult && (
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
            <strong>Total Revoked:</strong> {revokeResult.revoked}
          </p>
          <p style={{ wordBreak: "break-all" }}>
            <strong>Transaction Hash:</strong> {revokeResult.txHash}
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
              {(revokeResult.revokedIds || []).map((id) => (
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
