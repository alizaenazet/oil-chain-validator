import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
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
        Batch Registration
      </Link>

      {" | "}

      <Link to="/settings">
        Settings
      </Link>

      {" | "}

      <Link to="/login">
        Logout
      </Link>
    </nav>
  );
}

export default Navbar;