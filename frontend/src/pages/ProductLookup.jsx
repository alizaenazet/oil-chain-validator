import { useState } from "react";
import AdminLayout from "../components/AdminLayout";

function ProductLookup() {
  const [searchValue, setSearchValue] =
    useState("");

  const [product, setProduct] =
    useState(null);

  const handleSearch = () => {
    if (!searchValue) return;

    const mockProduct = {
      serialNumber: searchValue,
      brand: "Shell",
      variant: "Helix Ultra",
      oilType: "5W-30",
      status: "VALID",
      batchId: "BATCH-2026-001",
      manufacturer:
        "Shell Indonesia",
    };

    setProduct(mockProduct);
  };

  return (
    <AdminLayout>
      <div
        style={{
          padding: "20px",
        }}
      >
        <h1>
          Product Lookup
        </h1>

        <p>
          Search product details
          by serial number.
        </p>

        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow:
              "0 3px 10px rgba(0,0,0,0.08)",
          }}
        >
          <input
            type="text"
            placeholder="Enter Serial Number"
            value={searchValue}
            onChange={(e) =>
              setSearchValue(
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

          <button
            onClick={handleSearch}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding:
                "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Search Product
          </button>
        </div>

        {product && (
          <div
            style={{
              marginTop: "20px",
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow:
                "0 3px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2>
              Product Details
            </h2>

            <p>
              <strong>
                Serial Number:
              </strong>{" "}
              {
                product.serialNumber
              }
            </p>

            <p>
              <strong>
                Brand:
              </strong>{" "}
              {product.brand}
            </p>

            <p>
              <strong>
                Variant:
              </strong>{" "}
              {product.variant}
            </p>

            <p>
              <strong>
                Oil Type:
              </strong>{" "}
              {product.oilType}
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}
              {product.status}
            </p>

            <p>
              <strong>
                Batch ID:
              </strong>{" "}
              {product.batchId}
            </p>

            <p>
              <strong>
                Manufacturer:
              </strong>{" "}
              {
                product.manufacturer
              }
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ProductLookup;