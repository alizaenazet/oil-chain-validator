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

  const [loading, setLoading] =
    useState(true);

  const getStatusConfig = (
    status
  ) => {
    switch (status) {
      case "VALID":
        return {
          title:
            "✓ ORIGINAL PRODUCT",
          bg: "#ecfdf5",
          border:
            "1px solid #86efac",
          color: "#15803d",
        };

      case "USED":
        return {
          title:
            "⚠ PRODUCT ALREADY SCANNED",
          bg: "#fef9c3",
          border:
            "1px solid #fde047",
          color: "#a16207",
        };

      case "REVOKED":
        return {
          title:
            "✖ REVOKED PRODUCT",
          bg: "#fee2e2",
          border:
            "1px solid #fca5a5",
          color: "#b91c1c",
        };

      default:
        return {
          title: "UNKNOWN",
          bg: "#f8fafc",
          border:
            "1px solid #cbd5e1",
          color: "#334155",
        };
    }
  };

  useEffect(() => {
    const cached =
      sessionStorage.getItem(
        "verificationResult"
      );

    if (cached) {
  const parsedData =
    JSON.parse(cached);

  const updatedData = {
  ...parsedData,

  brand:
    parsedData.brand ||
    "Shell",

  variantId:
    parsedData.variantId ||
    "VAR-001",

  batchId:
    parsedData.batchId ||
    "BATCH-2026-001",

  manufacturer:
    parsedData.manufacturer ||
    "Shell Indonesia",

  firstScanTime:
    parsedData.firstScanTime ||
    "01/06/2026 09:15:22",

  firstScanLocation:
    parsedData.firstScanLocation ||
    "Surabaya, Indonesia",
};

  setVerificationResult(
    updatedData
  );

  setLocation(
    updatedData.location
  );

  setLoading(false);

  return;
}

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        const currentLocation =
          `${lat}, ${lng}`;

        setLocation(
          currentLocation
        );

        simulateValidation(
          currentLocation
        );
      },
      () => {
        const deniedLocation =
          "Location permission denied";

        setLocation(
          deniedLocation
        );

        simulateValidation(
          deniedLocation
        );
      }
    );
  }, []);

// Simulated Backend Relayer API Call
const simulateValidation = async (
  scanLocation
) => {
  setLoading(true);

  setTimeout(() => {
  const mockApiResponse = {
  serialNumber,

  status: "VALID",

  brand: "Shell",

  productName:
    "Helix Ultra",

  oilType:
    "5W-30",

  variantId:
    "VAR-001",

  batchId:
    "BATCH-2026-001",

  manufacturer:
    "Shell Indonesia",

  verifiedAt:
    new Date().toLocaleString(),

  location:
    scanLocation,

  firstScanTime:
    "01/06/2026 09:15:22",

  firstScanLocation:
    "Surabaya, Indonesia",
};
    sessionStorage.setItem(
      "verificationResult",
      JSON.stringify(
        mockApiResponse
      )
    );

    setVerificationResult(
      mockApiResponse
    );

    setLoading(false);
  }, 1500);
};

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
          background:
            "#f8fafc",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius:
              "16px",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h2>
            Validating Product...
          </h2>

          <p>
            Retrieving location
            and verifying
            authenticity.
          </p>
        </div>
      </div>
    );
  }

  const statusConfig =
    getStatusConfig(
      verificationResult?.status
    );

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

        <div
          style={{
            background:
              statusConfig.bg,
            border:
              statusConfig.border,
            borderRadius:
              "12px",
            padding: "20px",
          }}
        >
          <h2
            style={{
              color:
                statusConfig.color,
              marginTop: 0,
            }}
          >
            {statusConfig.title}
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
          <hr
  style={{
    margin: "20px 0",
    border:
      "1px solid #e2e8f0",
  }}
/>

<h3
  style={{
    color: "#1e293b",
  }}
>
  Product Information
</h3>

<p>
  <strong>
    Brand:
  </strong>{" "}
  {
    verificationResult.brand
  }
</p>

<p>
  <strong>
    Variant:
  </strong>{" "}
  {
    verificationResult.productName
  }
</p>

<p>
  <strong>
    Variant ID:
  </strong>{" "}
  {
    verificationResult.variantId
  }
</p>

<p>
  <strong>
    Batch ID:
  </strong>{" "}
  {
    verificationResult.batchId
  }
</p>

<p>
  <strong>
    Manufacturer:
  </strong>{" "}
  {
    verificationResult.manufacturer
  }
</p>
          <hr
  style={{
    margin: "20px 0",
    border:
      "1px solid #e2e8f0",
  }}
/>

<h3
  style={{
    color: "#1e293b",
  }}
>
  First Scan History
</h3>

<p>
  <strong>
    First Scan Time:
  </strong>{" "}
  {
    verificationResult.firstScanTime ||
    "01/06/2026 09:15:22"
  }
</p>

<p>
  <strong>
    First Scan Location:
  </strong>{" "}
  {
    verificationResult.firstScanLocation ||
    "Surabaya, Indonesia"
  }
</p>
        </div>
      </div>
    </div>
  );
}

export default Verify;