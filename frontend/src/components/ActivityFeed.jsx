export default function ActivityFeed({ issues }) {
  return (
    <div style={container}>
      <h3 style={{ marginBottom: "20px" }}>Recent Activity</h3>
      {issues.map((issue) => (
        <div key={issue.id} style={item}>
          <div>{issue.title}</div>
          <small style={{ color: "#8b949e" }}>{issue.status}</small>
        </div>
      ))}
    </div>
  );
}

const container = {
  background: "#1f2329",
  padding: "25px",
  borderRadius: "12px",
  border: "1px solid #2c3138",
};

const item = {
  padding: "10px 0",
  borderBottom: "1px solid #2c3138",
};
