import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

function Settings() {
  const [walletAddress, setWalletAddress] =
    useState("");

  const [serialNumber, setSerialNumber] =
    useState("");

  const [revokedSerials,
    setRevokedSerials] =
    useState(() => {
      const saved =
        localStorage.getItem(
          "revokedSerials"
        );

      return saved
        ? JSON.parse(saved)
        : [];
    });

  useEffect(() => {
    localStorage.setItem(
      "revokedSerials",
      JSON.stringify(
        revokedSerials
      )
    );
  }, [revokedSerials]);

  const handleTransferOwnership = () => {
    if (!walletAddress) return;

    alert(
      `Ownership transferred to ${walletAddress}`
    );

    setWalletAddress("");
  };

  const handleRevoke = () => {
    if (!serialNumber) return;

    setRevokedSerials([
      ...revokedSerials,
      serialNumber,
    ]);

    setSerialNumber("");
  };

  const handleDelete = (index) => {
    setRevokedSerials(
      revokedSerials.filter(
        (_, i) => i !== index
      )
    );
  };

  return (
    <AdminLayout>
      <h1
        style={{
          marginBottom: "25px",
          color: "#1e293b",
        }}
      >
        System Settings
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "25px",
        }}
      >
        {/* Transfer Ownership */}

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "15px",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              color: "#2563eb",
              marginBottom: "20px",
            }}
          >
            Transfer Ownership
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: "15px",
            }}
          >
            Transfer administrator
            rights to another wallet.
          </p>

          <input
            type="text"
            placeholder="Wallet Address"
            value={walletAddress}
            onChange={(e) =>
              setWalletAddress(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border:
                "1px solid #d1d5db",
              marginBottom: "15px",
            }}
          />

          <button
            onClick={
              handleTransferOwnership
            }
            style={{
              width: "100%",
              background:
                "#2563eb",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Transfer Ownership
          </button>
        </div>

        {/* Emergency Revoke */}

        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "15px",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              color: "#dc2626",
              marginBottom: "20px",
            }}
          >
            Emergency Revoke
          </h2>

          <p
            style={{
              color: "#64748b",
              marginBottom: "15px",
            }}
          >
            Revoke compromised
            product serial numbers.
          </p>

          <input
            type="text"
            placeholder="Serial Number"
            value={serialNumber}
            onChange={(e) =>
              setSerialNumber(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border:
                "1px solid #d1d5db",
              marginBottom: "15px",
            }}
          />

          <button
            onClick={handleRevoke}
            style={{
              width: "100%",
              background:
                "#dc2626",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Revoke Product
          </button>
        </div>
      </div>

      {/* Revoked Products */}

      <div
        style={{
          background: "#fff",
          marginTop: "30px",
          padding: "25px",
          borderRadius: "15px",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            color: "#1e293b",
            marginBottom: "20px",
          }}
        >
          Revoked Products
        </h2>

        {revokedSerials.length === 0 ? (
          <p
            style={{
              color: "#64748b",
            }}
          >
            No revoked products yet.
          </p>
        ) : (
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
                    "#f8fafc",
                }}
              >
                <th
                  style={{
                    padding:
                      "12px",
                    textAlign:
                      "left",
                  }}
                >
                  Serial Number
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
              {revokedSerials.map(
                (
                  serial,
                  index
                ) => (
                  <tr
                    key={index}
                    style={{
                      borderTop:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <td
                      style={{
                        padding:
                          "12px",
                      }}
                    >
                      {serial}
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
                            index
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
                            "8px",
                          cursor:
                            "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

export default Settings;