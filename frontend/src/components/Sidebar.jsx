import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const linkStyle = {
    textDecoration: "none",
    color: "#334155",
    fontWeight: "500",
    display: "block",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "8px",
    background: "#f8fafc",
  };

  return (
    <div
      style={{
        width: "260px",
        minHeight: "100vh",
        borderRight: "1px solid #e2e8f0",
        padding: "20px",
        background: "#ffffff",
      }}
    >
      <h2
        style={{
          color: "#1e293b",
          marginBottom: "20px",
        }}
      >
        Oil Chain Admin
      </h2>

      <hr />

      <div
        style={{
          marginTop: "20px",
        }}
      >
        <Link
          to="/dashboard"
          style={linkStyle}
        >
          Dashboard
        </Link>

        <Link
          to="/variants"
          style={linkStyle}
        >
          Variants
        </Link>

        <Link
          to="/batches"
          style={linkStyle}
        >
          Batch Registration
        </Link>

        <Link
          to="/qr-generator"
          style={linkStyle}
        >
          QR Generator
        </Link>

        <Link
          to="/product-lookup"
          style={linkStyle}
        >
          Product Lookup
        </Link>

        <Link
          to="/settings"
          style={linkStyle}
        >
          Settings
        </Link>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#ef4444",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;