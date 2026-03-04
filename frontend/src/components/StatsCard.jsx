export default function StatsCard({ title, value }) {
  return (
    <div style={cardStyle}>
      <div style={titleStyle}>{title}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

const cardStyle = {
  background: "#1f2329",
  padding: "30px",
  borderRadius: "12px",
  minWidth: "200px",
  border: "1px solid #2c3138",
};

const titleStyle = {
  color: "#9fa4ab",
  marginBottom: "10px",
};

const valueStyle = {
  fontSize: "28px",
  fontWeight: "600",
};
