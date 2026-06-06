import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

function BatchRegistration() {
  const [variantId, setVariantId] =
    useState("");

  const [serials, setSerials] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    registeredBatches,
    setRegisteredBatches,
  ] = useState(() => {
    const savedBatches =
      localStorage.getItem(
        "registeredBatches"
      );

    return savedBatches
      ? JSON.parse(savedBatches)
      : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "registeredBatches",
      JSON.stringify(
        registeredBatches
      )
    );
  }, [registeredBatches]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!variantId || !serials)
      return;

    setLoading(true);

    setTimeout(() => {
      const serialList =
        serials
          .split("\n")
          .filter(
            (item) =>
              item.trim() !== ""
          );

      const newBatch = {
        id: Date.now(),
        variantId,
        totalProducts:
          serialList.length,
        serials: serialList,
      };

      setRegisteredBatches(
        (prev) => [
          ...prev,
          newBatch,
        ]
      );

      setVariantId("");
      setSerials("");

      setLoading(false);
    }, 2000);
  };

  return (
    <AdminLayout>
      <div
        style={{
          padding: "20px",
        }}
      >
        <h1
          style={{
            color: "#1e293b",
            marginBottom: "5px",
          }}
        >
          Batch Registration
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Register product batches
          before distributing
          lubricant products.
        </p>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow:
              "0 3px 12px rgba(0,0,0,0.08)",
            marginBottom: "30px",
          }}
        >
          <h2>
            Create New Batch
          </h2>

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label>
                Variant ID
              </label>

              <br />

              <input
                type="number"
                value={variantId}
                disabled={loading}
                onChange={(e) =>
                  setVariantId(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "8px",
                  border:
                    "1px solid #cbd5e1",
                }}
              />
            </div>

            <div
              style={{
                marginBottom: "20px",
              }}
            >
              <label>
                Serial Numbers
              </label>

              <br />

              <textarea
                rows="10"
                value={serials}
                disabled={loading}
                placeholder={`SN001
SN002
SN003`}
                onChange={(e) =>
                  setSerials(
                    e.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  borderRadius: "8px",
                  border:
                    "1px solid #cbd5e1",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background:
                  loading
                    ? "#94a3b8"
                    : "#2563eb",
                color: "white",
                border: "none",
                padding:
                  "12px 20px",
                borderRadius:
                  "8px",
                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
                fontWeight:
                  "bold",
              }}
            >
              {loading
                ? "Registering Batch..."
                : "Register Batch"}
            </button>
          </form>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow:
              "0 3px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            Registered Batches
          </h2>

          {registeredBatches.length ===
          0 ? (
            <p>
              No batches
              registered yet.
            </p>
          ) : (
            registeredBatches.map(
              (batch) => (
                <div
                  key={batch.id}
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "12px",
                    padding:
                      "15px",
                    marginBottom:
                      "15px",
                    background:
                      "#f8fafc",
                  }}
                >
                  <p>
                    <strong>
                      Batch ID:
                    </strong>{" "}
                    {batch.id}
                  </p>

                  <p>
                    <strong>
                      Variant ID:
                    </strong>{" "}
                    {
                      batch.variantId
                    }
                  </p>

                  <p>
                    <strong>
                      Total Products:
                    </strong>{" "}
                    {
                      batch.totalProducts
                    }
                  </p>

                  <details>
                    <summary
                      style={{
                        cursor:
                          "pointer",
                        color:
                          "#2563eb",
                        fontWeight:
                          "bold",
                      }}
                    >
                      View Serial
                      Numbers
                    </summary>

                    <ul>
                      {batch.serials.map(
                        (
                          serial,
                          index
                        ) => (
                          <li
                            key={
                              index
                            }
                          >
                            {
                              serial
                            }
                          </li>
                        )
                      )}
                    </ul>
                  </details>
                </div>
              )
            )
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default BatchRegistration;