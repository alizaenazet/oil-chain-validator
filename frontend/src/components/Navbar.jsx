import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <div
      style={{
        padding: "15px",
        borderBottom: "1px solid #ccc",
        marginBottom: "20px",
      }}
    >
      <Link to="/dashboard">
        Dashboard
      </Link>

      {" | "}

      <Link to="/variants">
        Variants
      </Link>

      {" | "}

      <Link to="/batches">
        Batches
      </Link>

      {" | "}

      <Link to="/settings">
        Settings
      </Link>

      {" | "}

      <button
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default Navbar;