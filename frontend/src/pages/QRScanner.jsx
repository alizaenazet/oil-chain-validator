import { useState } from "react";
import { useNavigate } from "react-router-dom";

function QRScanner() {
  const [serialNumber, setSerialNumber] =
    useState("");

  const navigate = useNavigate();

  const handleScan = () => {
    if (!serialNumber) return;

    navigate(
      `/verify/${serialNumber}`
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "450px",
          boxShadow:
            "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          QR Scanner Simulation
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Simulate scanning a QR code
          by entering a product serial
          number.
        </p>

        <input
          type="text"
          placeholder="SN001"
          value={serialNumber}
          onChange={(e) =>
            setSerialNumber(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border:
              "1px solid #cbd5e1",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={handleScan}
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Simulate Scan
        </button>
      </div>
    </div>
  );
}

export default QRScanner;