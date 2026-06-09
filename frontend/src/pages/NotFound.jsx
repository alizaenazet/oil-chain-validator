import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg,#0f172a,#1e293b)",
        color: "white",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "120px",
            margin: 0,
          }}
        >
          404
        </h1>

        <h2>
          Page Not Found
        </h2>

        <p
          style={{
            color: "#cbd5e1",
            marginBottom: "30px",
          }}
        >
          The page you are looking for
          does not exist.
        </p>

        <Link
          to="/"
          style={{
            background: "#2563eb",
            color: "white",
            padding: "12px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;