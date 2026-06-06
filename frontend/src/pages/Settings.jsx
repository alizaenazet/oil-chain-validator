import { useState } from "react";
import Navbar from "../components/Navbar";

function Settings() {
  const [walletAddress, setWalletAddress] =
    useState("");

  const [revokedSerials, setRevokedSerials] =
    useState([]);

  const [serialNumber, setSerialNumber] =
    useState("");

  const handleTransferOwnership = () => {
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

      <ul>
        {revokedSerials.map(
          (serial, index) => (
            <li key={index}>
              {serial}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default Settings;