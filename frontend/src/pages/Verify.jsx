import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct, validateProduct } from "../services/productService";
import { getVariant } from "../services/variantService";
import { getApiError } from "../services/errorUtils";

const STATUS_CONFIG = {
  VALIDATED: {
    title: "ORIGINAL PRODUCT — VERIFIED",
    bg: "#ecfdf5",
    border: "1px solid #86efac",
    color: "#15803d",
  },
  ALREADY_USED: {
    title: "PRODUCT ALREADY SCANNED",
    bg: "#fef9c3",
    border: "1px solid #fde047",
    color: "#a16207",
  },
  REVOKED: {
    title: "COUNTERFEIT WARNING — REVOKED PRODUCT",
    bg: "#fee2e2",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
  },
  NOT_FOUND: {
    title: "PRODUCT NOT FOUND",
    bg: "#fee2e2",
    border: "1px solid #fca5a5",
    color: "#b91c1c",
  },
  ERROR: {
    title: "Unable to verify product",
    bg: "#f8fafc",
    border: "1px solid #cbd5e1",
    color: "#334155",
  },
};

function formatTimestamp(value) {
  if (!value) return "-";
  // Backend stores on-chain unix seconds (number). Convert to ms.
  const ms = Number(value) * 1000;
  if (!ms || Number.isNaN(ms)) return String(value);
  return new Date(ms).toLocaleString();
}

function Verify() {
  const { serialNumber } = useParams();

  const [location, setLocation] = useState("Resolving location…");
  const [loading, setLoading] = useState(true);
  const [outcome, setOutcome] = useState(null); // status key
  const [product, setProduct] = useState(null);
  const [variant, setVariant] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const resolveLocation = () =>
      new Promise((resolve) => {
        // 1. Helper untuk IP Fallback (Sudah langsung mengembalikan format teks)
        const fallbackToIP = async () => {
          try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();

            // Pastikan datanya ada, lalu format sesuai permintaanmu
            if (data.city && data.region && data.country_code) {
              resolve(`${data.city}, ${data.region}, ${data.country_code.toUpperCase()}`);
            } else {
              resolve("Unknown City, Unknown Region, ID");
            }
          } catch (error) {
            resolve("Location unavailable (Network error)");
          }
        };

        // 2. Helper BARU: Reverse Geocoding (Ubah Lat/Lon GPS jadi Teks Alamat)
        const reverseGeocode = async (lat, lon) => {
          try {
            // Menggunakan OpenStreetMap Nominatim API (Gratis, tanpa API Key)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.address) {
              const addr = data.address;
              // Pemetaan dinamis: Nominatim terkadang memakai 'city', 'town', atau 'city_district'
              const city = addr.city || addr.town || addr.city_district || addr.county || "Unknown City";
              const region = addr.state || addr.region || addr.province || "Unknown Region";
              const countryCode = (addr.country_code || "ID").toUpperCase();

              resolve(`${city}, ${region}, ${countryCode}`);
            } else {
              // Jika API gagal membaca alamat, kembalikan koordinat sebagai cadangan
              resolve(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
            }
          } catch (error) {
            // Jika jaringan gagal saat reverse geocoding
            resolve(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
          }
        };

        // 3. Jika browser tidak mendukung GPS, langsung tembak IP
        if (!navigator.geolocation) {
          return fallbackToIP();
        }

        // 4. Coba ambil GPS aslinya
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // BERHASIL DAPAT GPS -> Jangan langsung resolve, terjemahkan dulu!
            reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            // Jika user menolak (Permission denied) atau Timeout, jalankan fallback IP
            fallbackToIP();
          },
          { timeout: 8000 }
        );
      });

    const enrichVariant = async (variantId) => {
      if (!variantId) return;
      try {
        const res = await getVariant(variantId);
        if (!cancelled) setVariant(res?.data ?? null);
      } catch {
        /* variant enrichment is best-effort */
      }
    };

    const run = async () => {
      setLoading(true);

      if (cancelled) return;

      const scanLocation = await resolveLocation();
      // 1. Inspect current on-chain status first.
      let current;
      setLocation(scanLocation)
      try {
        const res = await getProduct(serialNumber);
        current = res?.data;
      } catch (err) {
        const { code } = getApiError(err);
        if (cancelled) return;
        if (code === "PRODUCT_NOT_FOUND") {
          setOutcome("NOT_FOUND");
        } else {
          setOutcome("ERROR");
          setMessage(getApiError(err).message);
        }
        setLocation("-")
        setLoading(false);
        return;
      }

      if (cancelled) return;
      setLocation(current.scanLocation)
      setProduct(current);

      // 2. Branch on status.
      if (current.status === "REVOKED") {
        setOutcome("REVOKED");
        await enrichVariant(current.variantId);
        setLoading(false);
        return;
      }

      if (current.status === "VALIDATED") {
        setOutcome("ALREADY_USED");
        await enrichVariant(current.variantId);
        setLoading(false);
        return;
      }


      // status === "NEW" -> perform the first validation (gas relayer).
      try {
        const res = await validateProduct(serialNumber, scanLocation);
        if (cancelled) return;
        setMessage(res?.message || "Product validated successfully.");
        setOutcome("VALIDATED");

        // Refresh product details to reflect the new VALIDATED state.
        try {
          const refreshed = await getProduct(serialNumber);
          if (!cancelled) setProduct(refreshed?.data ?? current);
        } catch {
          /* keep existing product data */
        }
        await enrichVariant(current.variantId);
      } catch (err) {
        if (cancelled) return;
        const { code, message: msg } = getApiError(err);
        if (code === "REVOKED") {
          setOutcome("REVOKED");
        } else {
          setOutcome("ERROR");
          setMessage(msg);
        }
        await enrichVariant(current.variantId);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [serialNumber]);

  if (loading) {
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
            padding: "30px",
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h2>Validating Product…</h2>
          <p>Retrieving location and verifying authenticity on-chain.</p>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[outcome] || STATUS_CONFIG.ERROR;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px" }}>
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#1e293b", margin: "10px" }}>
          Product
        </h1>
        <h1 style={{ color: "#1e293b", margin: "20px" }}>
          Verification
        </h1>

        <p style={{ color: "#64748b", marginBottom: "25px" }}>
          Validate lubricant authenticity using the product serial number.
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
            <strong>Serial Number:</strong> {serialNumber}
          </p>
          <p>
            <strong>Scan Location:</strong> {location}
          </p>
        </div>

        <div
          style={{
            background: config.bg,
            border: config.border,
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2 style={{ color: config.color, marginTop: 0 }}>{config.title}</h2>

          {message && <p>{message}</p>}

          {outcome === "NOT_FOUND" && (
            <p>
              This serial number is not registered on-chain. The product may be
              counterfeit.
            </p>
          )}

          {product && (
            <>
              <hr style={{ margin: "20px 0", border: "1px solid #e2e8f0" }} />

              <h3 style={{ color: "#1e293b" }}>Product Information</h3>

              <p>
                <strong>Serial Number:</strong> {product.serialNumber}
              </p>
              <p>
                <strong>Status:</strong> {product.status}
              </p>
              <p>
                <strong>Variant ID:</strong> {product.variantId}
              </p>
              {variant && (
                <>
                  <p>
                    <strong>Brand:</strong> {variant.brand}
                  </p>
                  <p>
                    <strong>Oil Type:</strong> {variant.oilType}
                  </p>
                </>
              )}
              <p>
                <strong>Registered At:</strong>{" "}
                {formatTimestamp(product.registeredAt)}
              </p>
              <p>
                <strong>Validated At:</strong>{" "}
                {product.validatedAt
                  ? formatTimestamp(product.validatedAt)
                  : "-"}
              </p>
              <p>
                <strong>Last Scan Location:</strong>{" "}
                {product.lastScanLocation || "-"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Verify;
