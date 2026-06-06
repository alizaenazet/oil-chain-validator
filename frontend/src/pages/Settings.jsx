import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

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
    <div>
      <Navbar />

      <h1>System Settings</h1>

      <hr />

      <h2>Transfer Ownership</h2>

      <input
        type="text"
        placeholder="Wallet Address"
        value={walletAddress}
        onChange={(e) =>
          setWalletAddress(
            e.target.value
          )
        }
      />

      <button
        onClick={handleTransferOwnership}
      >
        Transfer
      </button>

      <hr />

      <h2>Emergency Revoke</h2>

      <input
        type="text"
        placeholder="Serial Number"
        value={serialNumber}
        onChange={(e) =>
          setSerialNumber(
            e.target.value
          )
        }
      />

      <button onClick={handleRevoke}>
        Revoke
      </button>

      <h3>Revoked Products</h3>

      {revokedSerials.length === 0 ? (
        <p>
          No revoked products yet.
        </p>
      ) : (
        <ul>
          {revokedSerials.map(
            (serial, index) => (
              <li key={index}>
                {serial}

                <button
                  style={{
                    marginLeft: "10px",
                  }}
                  onClick={() =>
                    handleDelete(
                      index
                    )
                  }
                >
                  Remove
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

export default Settings;