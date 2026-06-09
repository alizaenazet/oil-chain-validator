import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { getProduct } from "../services/productService";
import { getVariant } from "../services/variantService";
import { getApiError } from "../services/errorUtils";

function formatTimestamp(value) {
  if (!value) return "-";
  const ms = Number(value) * 1000;
  if (!ms || Number.isNaN(ms)) return String(value);
  return new Date(ms).toLocaleString();
}

function ProductLookup() {
  const [searchValue, setSearchValue] = useState("");
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    const serial = searchValue.trim();
    if (!serial) return;

    setLoading(true);
    setError(null);
    setProduct(null);
    setVariant(null);

    try {
      const res = await getProduct(serial);
      const data = res?.data ?? null;
      setProduct(data);

      if (data?.variantId) {
        try {
          const vRes = await getVariant(data.variantId);
          setVariant(vRes?.data ?? null);
        } catch {
          /* best-effort variant enrichment */
        }
      }
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: "10px" }}>
        <h1>Product Lookup</h1>
        <p>Search on-chain product details by serial number.</p>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          }}
        >
          <input
            type="text"
            placeholder="Enter Serial Number (e.g. OIL-PERT-2024-000001)"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              marginBottom: "15px",
            }}
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              background: loading ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Searching…" : "Search Product"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: "20px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              padding: "15px",
              borderRadius: "12px",
            }}
          >
            {error}
          </div>
        )}

        {product && (
          <div
            style={{
              marginTop: "20px",
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2>Product Details</h2>

            <p style={{ wordBreak: "break-all" }}>
              <strong>Product ID (hash):</strong> {product.productId}
            </p>
            <p>
              <strong>Serial Number:</strong> {product.serialNumber}
            </p>
            <p>
              <strong>Status:</strong> {product.status}
            </p>
            <p>
              <strong>Variant ID:</strong> {product.variantId}
            </p>
            {variant && (
              <>
                <p>
                  <strong>Brand:</strong> {variant.brand}
                </p>
                <p>
                  <strong>Oil Type:</strong> {variant.oilType}
                </p>
              </>
            )}
            <p>
              <strong>Registered At:</strong>{" "}
              {formatTimestamp(product.registeredAt)}
            </p>
            <p>
              <strong>Validated At:</strong>{" "}
              {product.validatedAt
                ? formatTimestamp(product.validatedAt)
                : "-"}
            </p>
            <p>
              <strong>Last Scan Location:</strong>{" "}
              {product.lastScanLocation || "-"}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ProductLookup;
