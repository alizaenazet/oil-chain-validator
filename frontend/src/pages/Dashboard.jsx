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

      <h1>Dashboard</h1>

      <div>
        <h3>Total Variants</h3>
        <p>{stats.totalVariants}</p>
      </div>

      <div>
        <h3>Total Products</h3>
        <p>{stats.totalProducts}</p>
      </div>

      <div>
        <h3>Total Validated</h3>
        <p>{stats.totalValidated}</p>
      </div>
    </div>
  );
}

export default Dashboard;