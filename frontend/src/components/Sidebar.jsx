import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        borderRight: "1px solid #ddd",
        padding: "20px",
      }}
    >
      <h2>Oil Chain Admin</h2>

      <hr />

      <p>
        <Link to="/dashboard">
          Dashboard
        </Link>
      </p>

      <p>
        <Link to="/variants">
          Variants
        </Link>
      </p>

      <p>
        <Link to="/batches">
          Batch Registration
        </Link>
      </p>

      <p>
        <Link to="/settings">
          Settings
        </Link>
      </p>
    </div>
  );
}

export default Sidebar;