import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import AdminLayout from "../components/AdminLayout";

function QRGenerator() {
  const [serialNumber, setSerialNumber] =
    useState("");

  const [qrValue, setQrValue] =
    useState("");

  const generateQR = () => {
    if (!serialNumber) return;

    const verifyUrl =
      `${window.location.origin}/verify/${serialNumber}`;

    setQrValue(verifyUrl);
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
            marginBottom: "10px",
          }}
        >
          QR Code Generator
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Generate QR Code for
          lubricant products.
        </p>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow:
              "0 3px 12px rgba(0,0,0,0.08)",
          }}
        >
          <label>
            Product Serial Number
          </label>

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
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "8px",
              border:
                "1px solid #cbd5e1",
            }}
          />

          <button
            onClick={generateQR}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding:
                "12px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Generate QR
          </button>

          {qrValue && (
            <div
              style={{
                marginTop: "30px",
                textAlign: "center",
              }}
            >
              <QRCodeCanvas
                value={qrValue}
                size={250}
              />

              <p
                style={{
                  marginTop: "15px",
                  wordBreak:
                    "break-all",
                }}
              >
                {qrValue}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default QRGenerator;