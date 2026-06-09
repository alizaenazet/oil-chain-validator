import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { getStats } from "../services/statService";
import { getApiError } from "../services/errorUtils";

function Dashboard() {
  const [totalVariants, setTotalVariants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);

    try {
      const res = await getStats();
      setTotalVariants(
        Number(res?.data?.totalMasterVariantsOnChain ?? 0)
      );
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getStats();
        if (!active) return;
        setTotalVariants(
          Number(res?.data?.totalMasterVariantsOnChain ?? 0)
        );
      } catch (err) {
        if (active) setError(getApiError(err).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminLayout>
      <div style={{ padding: "20px" }}>
        <h1 style={{ marginBottom: "5px", color: "#1e293b" }}>
          Dashboard Overview
        </h1>

        <p style={{ color: "#64748b", marginBottom: "30px", marginTop: "15px" }}>
          Monitor your anti-counterfeit oil verification system.
        </p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            {error}{" "}
            <button
              onClick={loadStats}
              style={{
                marginLeft: "10px",
                background: "#b91c1c",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "#2563eb",
              color: "white",
              padding: "25px",
              borderRadius: "15px",
              boxShadow: "0 5px 15px rgba(37,99,235,0.3)",
            }}
          >
            <h3>Total Master Variants (On-Chain)</h3>

            <h1 style={{ marginTop: "15px", fontSize: "40px" }}>
              {loading ? "…" : totalVariants}
            </h1>
          </div>
        </div>

        <div
          style={{
            marginTop: "30px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "15px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
            }}
          >
            <h2>System Status</h2>

            <p>
              Backend API:{" "}
              <strong>{error ? "Unreachable" : "Connected"}</strong>
            </p>

            <p>
              Stats Endpoint:{" "}
              <strong>{loading ? "Loading…" : "/stats"}</strong>
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
