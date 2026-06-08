import AdminLayout from "../components/AdminLayout";

function Dashboard() {
const stats = {
totalVariants: 5,
totalProducts: 1250,
totalValidated: 847,
totalRevoked: 23,
};

const successRate = (
(stats.totalValidated /
stats.totalProducts) *
100
).toFixed(1);

const recentActivities = [
"Shell 5W-30 Variant Added",
"Batch SN001-SN500 Registered",
"Product SN123 Validated",
"Product SN456 Validated",
];

return ( <AdminLayout>
<div
style={{
padding: "20px",
}}
>
<h1
style={{
marginBottom: "5px",
color: "#1e293b",
}}
>
Dashboard Overview </h1>

```
    <p
      style={{
        color: "#64748b",
        marginBottom: "30px",
      }}
    >
      Monitor your anti-counterfeit
      oil verification system.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
      }}
    >
      <div
        style={{
          background: "#2563eb",
          color: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow:
            "0 5px 15px rgba(37,99,235,0.3)",
        }}
      >
        <h3>Total Variants</h3>

        <h1
          style={{
            marginTop: "15px",
            fontSize: "40px",
          }}
        >
          {stats.totalVariants}
        </h1>
      </div>

      <div
        style={{
          background: "#10b981",
          color: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow:
            "0 5px 15px rgba(16,185,129,0.3)",
        }}
      >
        <h3>Total Products</h3>

        <h1
          style={{
            marginTop: "15px",
            fontSize: "40px",
          }}
        >
          {stats.totalProducts}
        </h1>
      </div>

      <div
        style={{
          background: "#f59e0b",
          color: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow:
            "0 5px 15px rgba(245,158,11,0.3)",
        }}
      >
        <h3>Total Validated</h3>

        <h1
          style={{
            marginTop: "15px",
            fontSize: "40px",
          }}
        >
          {stats.totalValidated}
        </h1>
      </div>

      <div
        style={{
          background: "#ef4444",
          color: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow:
            "0 5px 15px rgba(239,68,68,0.3)",
        }}
      >
        <h3>Total Revoked</h3>

        <h1
          style={{
            marginTop: "15px",
            fontSize: "40px",
          }}
        >
          {stats.totalRevoked}
        </h1>
      </div>
    </div>

    <div
      style={{
        marginTop: "30px",
        background: "white",
        padding: "25px",
        borderRadius: "15px",
        boxShadow:
          "0 3px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          color: "#1e293b",
        }}
      >
        Recent Activities
      </h2>

      {recentActivities.map(
        (activity, index) => (
          <div
            key={index}
            style={{
              padding: "12px",
              borderBottom:
                "1px solid #e2e8f0",
            }}
          >
            ✅ {activity}
          </div>
        )
      )}
    </div>

    <div
      style={{
        marginTop: "30px",
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow:
            "0 3px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h2>System Status</h2>

        <p>
          Smart Contract:
          <strong>
            {" "}
            getSystemStats()
          </strong>
        </p>

        <p>
          Blockchain Network:
          <strong>
            {" "}
            Online
          </strong>
        </p>

        <p>
          Relayer API:
          <strong>
            {" "}
            Running
          </strong>
        </p>

        <p>
          Redis Cache:
          <strong>
            {" "}
            Active
          </strong>
        </p>
      </div>

      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "15px",
          boxShadow:
            "0 3px 12px rgba(0,0,0,0.08)",
        }}
      >
        <h2>
          Security Summary
        </h2>

        <p>
          Revoked Products:
          <strong>
            {" "}
            {stats.totalRevoked}
          </strong>
        </p>

        <p>
          Verification Success Rate:
          <strong>
            {" "}
            {successRate}%
          </strong>
        </p>

        <p>
          Ownership Status:
          <strong>
            {" "}
            Secure
          </strong>
        </p>

        <p>
          Last Security Check:
          <strong>
            {" "}
            Today
          </strong>
        </p>
      </div>
    </div>
  </div>
</AdminLayout>


);
}

export default Dashboard;
