import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

function Variants() {
  const [brand, setBrand] = useState("");
  const [oilType, setOilType] = useState("");

  const [variants, setVariants] = useState(() => {
    const savedVariants =
      localStorage.getItem("variants");

    return savedVariants
      ? JSON.parse(savedVariants)
      : [
          {
            id: 1,
            brand: "Shell",
            oilType: "5W-30",
          },
          {
            id: 2,
            brand: "Pertamina",
            oilType: "10W-40",
          },
        ];
  });

  useEffect(() => {
    localStorage.setItem(
      "variants",
      JSON.stringify(variants)
    );
  }, [variants]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!brand || !oilType) return;

    const newVariant = {
      id: Date.now(),
      brand,
      oilType,
    };

    setVariants([
      ...variants,
      newVariant,
    ]);

    setBrand("");
    setOilType("");
  };

  const handleDelete = (id) => {
    setVariants(
      variants.filter(
        (variant) =>
          variant.id !== id
      )
    );
  };

  return (
    <AdminLayout>
      <div style={{ padding: "20px" }}>
        <h1
          style={{
            color: "#1e293b",
            marginBottom: "5px",
          }}
        >
          Variant Management
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Manage lubricant product
          variants registered in
          the system.
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
          <h2>Add New Variant</h2>

          <form
            onSubmit={handleSubmit}
          >
            <div
              style={{
                marginBottom: "15px",
              }}
            >
              <label>
                Brand
              </label>

              <br />

              <input
                type="text"
                placeholder="Shell"
                value={brand}
                onChange={(e) =>
                  setBrand(
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
                Oil Type
              </label>

              <br />

              <input
                type="text"
                placeholder="5W-30"
                value={oilType}
                onChange={(e) =>
                  setOilType(
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
              style={{
                background:
                  "#2563eb",
                color: "white",
                border: "none",
                padding:
                  "12px 20px",
                borderRadius:
                  "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Add Variant
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
            Variant List
          </h2>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f1f5f9",
                  }}
                >
                  <th
                    style={{
                      padding:
                        "12px",
                    }}
                  >
                    ID
                  </th>

                  <th
                    style={{
                      padding:
                        "12px",
                    }}
                  >
                    Brand
                  </th>

                  <th
                    style={{
                      padding:
                        "12px",
                    }}
                  >
                    Oil Type
                  </th>

                  <th
                    style={{
                      padding:
                        "12px",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {variants.map(
                  (variant) => (
                    <tr
                      key={
                        variant.id
                      }
                      style={{
                        borderBottom:
                          "1px solid #e2e8f0",
                      }}
                    >
                      <td
                        style={{
                          padding:
                            "12px",
                        }}
                      >
                        {
                          variant.id
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "12px",
                        }}
                      >
                        {
                          variant.brand
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "12px",
                        }}
                      >
                        {
                          variant.oilType
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "12px",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleDelete(
                              variant.id
                            )
                          }
                          style={{
                            background:
                              "#ef4444",
                            color:
                              "white",
                            border:
                              "none",
                            padding:
                              "8px 14px",
                            borderRadius:
                              "6px",
                            cursor:
                              "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
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