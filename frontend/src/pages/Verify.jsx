import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Verify() {
  const { serialNumber } = useParams();

  const [location, setLocation] =
    useState("Loading location...");

  const [
    verificationResult,
    setVerificationResult,
  ] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        setLocation(`${lat}, ${lng}`);
      },
      (error) => {
        console.error(error);

        setLocation(
          "Location permission denied"
        );
      }
    );
  }, []);

  useEffect(() => {
    const cached =
      sessionStorage.getItem(
        "verificationResult"
      );

    if (cached) {
      setVerificationResult(
        JSON.parse(cached)
      );
    }
  }, []);

  const simulateValidation = () => {
    const data = {
      serialNumber,
      status: "VALID",
      productName:
        "Shell Helix Ultra",
      oilType: "5W-30",
      verifiedAt:
        new Date().toLocaleString(),
      location,
    };

    sessionStorage.setItem(
      "verificationResult",
      JSON.stringify(data)
    );

    setVerificationResult(data);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          boxShadow:
            "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            color: "#1e293b",
            marginBottom: "10px",
          }}
        >
          Product Verification
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Validate lubricant
          authenticity using the
          product serial number.
        </p>

        <div
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <p>
            <strong>
              Serial Number:
            </strong>{" "}
            {serialNumber}
          </p>

          <p>
            <strong>
              Current Location:
            </strong>{" "}
            {location}
          </p>
        </div>

        <button
          onClick={simulateValidation}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Verify Product
        </button>

        {verificationResult && (
          <div
            style={{
              marginTop: "25px",
              background: "#ecfdf5",
              border:
                "1px solid #86efac",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <h2
              style={{
                color: "#15803d",
                marginTop: 0,
              }}
            >
              ✓ Verification Success
            </h2>

            <p>
              <strong>
                Serial Number:
              </strong>{" "}
              {
                verificationResult.serialNumber
              }
            </p>

            <p>
              <strong>
                Product:
              </strong>{" "}
              {
                verificationResult.productName
              }
            </p>

            <p>
              <strong>
                Oil Type:
              </strong>{" "}
              {
                verificationResult.oilType
              }
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}
              {
                verificationResult.status
              }
            </p>

            <p>
              <strong>
                Verified At:
              </strong>{" "}
              {
                verificationResult.verifiedAt
              }
            </p>

            <p>
              <strong>
                Scan Location:
              </strong>{" "}
              {
                verificationResult.location
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Verify;