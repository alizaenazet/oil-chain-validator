import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { addVariant } from "../services/adminService";
import { getStats } from "../services/statService";
import { listVariants } from "../services/variantService";
import { getApiError } from "../services/errorUtils";

function Variants() {
  const [brand, setBrand] = useState("");
  const [oilType, setOilType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [variants, setVariants] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadVariants = async () => {
    setLoadingList(true);
    try {
      const statsRes = await getStats();
      const total = Number(
        statsRes?.data?.totalMasterVariantsOnChain ?? 0
      );
      const list = await listVariants(total);
      setVariants(list);
    } catch (err) {
      showToast(getApiError(err).message, "error");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const statsRes = await getStats();
        const total = Number(
          statsRes?.data?.totalMasterVariantsOnChain ?? 0
        );
        const list = await listVariants(total);
        if (active) setVariants(list);
      } catch (err) {
        if (active) showToast(getApiError(err).message, "error");
      } finally {
        if (active) setLoadingList(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brand.trim() || !oilType.trim()) {
      showToast("Brand dan Oil Type wajib diisi.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addVariant(brand.trim(), oilType.trim());
      showToast(
        `Variant added on-chain (tx: ${String(
          res?.data?.txHash || ""
        ).slice(0, 10)}…)`,
        "success"
      );
      setBrand("");
      setOilType("");
      await loadVariants();
    } catch (err) {
      showToast(getApiError(err).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVariants = variants.filter(
    (variant) =>
      variant.brand
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      variant.oilType
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

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
          Variant Management
        </h1>

        <p style={{ color: "#64748b", marginBottom: "25px" }}>
          Manage lubricant product variants registered on-chain.
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
          <h2>Add New Variant</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label>Brand</label>
              <br />
              <input
                type="text"
                placeholder="Pertamina"
                value={brand}
                disabled={submitting}
                onChange={(e) => setBrand(e.target.value)}
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
              <label>Oil Type</label>
              <br />
              <input
                type="text"
                placeholder="SAE 10W-40"
                value={oilType}
                disabled={submitting}
                onChange={(e) => setOilType(e.target.value)}
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
              disabled={submitting}
              style={{
                background: submitting ? "#94a3b8" : "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "8px",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              {submitting ? "Submitting to chain…" : "Add Variant"}
            </button>
          </form>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>Variant List</h2>
            <button
              onClick={loadVariants}
              disabled={loadingList}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: loadingList ? "not-allowed" : "pointer",
              }}
            >
              {loadingList ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          <input
            type="text"
            placeholder="Search Brand / Oil Type…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "300px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              marginBottom: "20px",
            }}
          />

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  <th style={{ padding: "12px" }}>Variant ID</th>
                  <th style={{ padding: "12px" }}>Brand</th>
                  <th style={{ padding: "12px" }}>Oil Type</th>
                </tr>
              </thead>

              <tbody>
                {loadingList ? (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      Loading variants from chain…
                    </td>
                  </tr>
                ) : filteredVariants.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      No variants found
                    </td>
                  </tr>
                ) : (
                  filteredVariants.map((variant) => (
                    <tr
                      key={variant.variantId}
                      style={{ borderBottom: "1px solid #e2e8f0" }}
                    >
                      <td style={{ padding: "12px" }}>
                        {variant.variantId}
                      </td>
                      <td style={{ padding: "12px" }}>{variant.brand}</td>
                      <td style={{ padding: "12px" }}>{variant.oilType}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Variants;
