import Navbar from "../components/Navbar";

function Dashboard() {
  const stats = {
    totalVariants: 5,
    totalProducts: 1250,
    totalValidated: 847,
  };

  return (
    <div>
      <Navbar />

      <div style={{ padding: "20px" }}>
        <h1>Dashboard Overview</h1>

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              minWidth: "220px",
              borderRadius: "8px",
            }}
          >
            <h3>Total Variants</h3>

            <h2>
              {stats.totalVariants}
            </h2>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              minWidth: "220px",
              borderRadius: "8px",
            }}
          >
            <h3>Total Products</h3>

            <h2>
              {stats.totalProducts}
            </h2>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              minWidth: "220px",
              borderRadius: "8px",
            }}
          >
            <h3>Total Validated</h3>

            <h2>
              {stats.totalValidated}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;