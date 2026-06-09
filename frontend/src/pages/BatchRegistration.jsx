import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { registerBatch } from "../services/adminService";
import { getApiError } from "../services/errorUtils";

function BatchRegistration() {
  const [variantId, setVariantId] = useState("");
  const [serials, setSerials] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflicts([]);

    const serialList = serials
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (!variantId || serialList.length === 0) {
      showToast("Variant ID dan minimal satu Serial Number wajib diisi.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await registerBatch(variantId, serialList);
      setResult(res?.data ?? null);
      showToast(
        `${res?.data?.registered ?? serialList.length} product(s) registered on-chain.`,
        "success"
      );
      setVariantId("");
      setSerials("");
    } catch (err) {
      const apiErr = getApiError(err);
      if (apiErr.code === "PRODUCT_ALREADY_EXISTS") {
        setConflicts(apiErr.details?.conflictingIds || []);
        showToast("Some serial numbers are already registered.", "error");
      } else {
        showToast(apiErr.message, "error");
      }
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

      <div style={{ padding: "20px" }}>
        <h1 style={{ color: "#1e293b", marginBottom: "5px" }}>
          Batch Registration
        </h1>

        <p style={{ color: "#64748b", marginBottom: "25px" }}>
          Register product batches on-chain before distributing lubricant
          products. Enter one raw serial number per line.
        </p>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
            marginBottom: "30px",
          }}
        >
          <h2>Create New Batch</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label>Variant ID</label>
              <br />
              <input
                type="number"
                min="1"
                value={variantId}
                disabled={loading}
                onChange={(e) => setVariantId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label>Serial Numbers (one per line)</label>
              <br />
              <textarea
                rows="10"
                value={serials}
                disabled={loading}
                placeholder={`OIL-PERT-2024-000001\nOIL-PERT-2024-000002\nOIL-PERT-2024-000003`}
                onChange={(e) => setSerials(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#94a3b8" : "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              {loading ? "Registering Batch on-chain…" : "Register Batch"}
            </button>
          </form>
        </div>

        {conflicts.length > 0 && (
          <div
            style={{
              background: "#fff7ed",
              border: "1px solid #fdba74",
              padding: "20px",
              borderRadius: "15px",
              marginBottom: "30px",
            }}
          >
            <h3 style={{ color: "#c2410c", marginTop: 0 }}>
              Conflicting Serial Numbers
            </h3>
            <p style={{ color: "#7c2d12" }}>
              The following serial numbers are already registered on-chain and
              were not added:
            </p>
            <ul>
              {conflicts.map((id) => (
                <li key={id} style={{ color: "#7c2d12" }}>
                  {id}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result && (
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "15px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>Last Registered Batch</h2>

            <p>
              <strong>Variant ID:</strong> {result.variantId}
            </p>
            <p>
              <strong>Total Registered:</strong> {result.registered}
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
                View Hashed Product IDs
              </summary>
              <ul>
                {(result.productIds || []).map((id) => (
                  <li key={id} style={{ wordBreak: "break-all" }}>
                    {id}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default BatchRegistration;
