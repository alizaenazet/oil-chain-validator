import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Verify() {
  const { serialNumber } = useParams();

  const [location, setLocation] = useState(
    "Loading location..."
  );

  const [verificationResult, setVerificationResult] =
    useState(null);

  // Ambil lokasi pengguna
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

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

  // Ambil data dari session storage saat halaman dibuka
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

  // Simulasi validasi produk
  const simulateValidation = () => {
    const data = {
      serialNumber,
      status: "USED",
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
    <div style={{ padding: "20px" }}>
      <h1>Verify Product</h1>

      <p>
        <strong>Serial Number:</strong>{" "}
        {serialNumber}
      </p>

      <p>
        <strong>Location:</strong>{" "}
        {location}
      </p>

      <button onClick={simulateValidation}>
        Simulate Verify
      </button>

      {verificationResult && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h3>Verification Result</h3>

          <p>
            <strong>Serial:</strong>{" "}
            {
              verificationResult.serialNumber
            }
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {verificationResult.status}
          </p>

          <p>
            <strong>Verified At:</strong>{" "}
            {
              verificationResult.verifiedAt
            }
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {verificationResult.location}
          </p>
        </div>
      )}
    </div>
  );
}

export default Verify;