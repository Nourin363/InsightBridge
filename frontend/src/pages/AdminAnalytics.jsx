import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./AdminAnalytics.css";

export default function AdminAnalytics() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [hoverDomain, setHoverDomain] = useState(null);
  const [hoverPriority, setHoverPriority] = useState(null);
  const [hoverLifecycle, setHoverLifecycle] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://127.0.0.1:8000/api/issues/admin-dashboard/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Analytics Data:", result);
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate, token]);

  if (loading) return <div className="analytics-loading">Loading...</div>;
  if (!data) return null;

  /* =========================
     PREPARE DATA
  ========================= */

  const domainChartData = data.domains.map((d) => ({
    name: d.name,
    value: d.total,
  }));

  const priorityChartData = [
    { name: "HIGH", value: data.priority_totals.high },
    { name: "MEDIUM", value: data.priority_totals.medium },
    { name: "LOW", value: data.priority_totals.low },
  ];

  const lifecycleChartData = [
    { name: "OPEN", value: data.lifecycle_totals.open },
    { name: "IN REVIEW", value: data.lifecycle_totals.in_review },
    { name: "RESOLVED", value: data.lifecycle_totals.resolved },
  ];

  const COLORS = ["#6f8a6a", "#7f9182", "#4e6454", "#9cad9e"];

  /* =========================
     BREAKDOWN LOGIC
  ========================= */

  const getPriorityBreakdown = (priority) => {
    return data.domains
      .filter((d) => d.priority[priority.toLowerCase()] > 0)
      .map((d) => `${d.name} (${d.priority[priority.toLowerCase()]})`);
  };

  const getLifecycleBreakdown = (stage) => {
    const key =
      stage === "IN REVIEW" ? "in_review" : stage.toLowerCase();

    return data.domains
      .filter((d) => d.lifecycle[key] > 0)
      .map((d) => `${d.name} (${d.lifecycle[key]})`);
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="analytics-container">

      {/* ================= DOMAIN IMPACT ================= */}

      <section className="analytics-card">

        <h3>Domain Impact Mapping</h3>

        <div className="grid-layout">

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data.domains}
                dataKey="total"
                nameKey="name"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={3}
                onMouseEnter={(entry) => setHoverDomain(entry)}
                onMouseLeave={() => setHoverDomain(null)}
              >
                {data.domains.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="context-panel">
            {hoverDomain ? (
              <>
                <h4>{hoverDomain.name.toUpperCase()}</h4>
                <p><strong>Total Issues:</strong> {hoverDomain.total}</p>

                <p>
                  <strong>Priority →</strong>{" "}
                  High: {hoverDomain.priority.high} |{" "}
                  Medium: {hoverDomain.priority.medium} |{" "}
                  Low: {hoverDomain.priority.low}
                </p>

                <p>
                  <strong>Lifecycle →</strong>{" "}
                  Open: {hoverDomain.lifecycle.open} |{" "}
                  In Review: {hoverDomain.lifecycle.in_review} |{" "}
                  Resolved: {hoverDomain.lifecycle.resolved}
                </p>
              </>
            ) : (
              <p>Hover a domain sector to inspect full breakdown.</p>
            )}
          </div>

        </div>
      </section>

      {/* ================= PRIORITY DISTRIBUTION ================= */}

      <section className="analytics-card">

        <h3>Priority Distribution</h3>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={priorityChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a30" />
            <XAxis dataKey="name" stroke="#8fa88b" />
            <YAxis stroke="#8fa88b" />
            <Bar
              dataKey="value"
              fill="#6f8a6a"
              radius={[10, 10, 0, 0]}
              onMouseEnter={(data) => setHoverPriority(data.name)}
              onMouseLeave={() => setHoverPriority(null)}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="hover-details">
          {hoverPriority ? (
            <>
              <strong>{hoverPriority}</strong> priority issues:
              <ul>
                {getPriorityBreakdown(hoverPriority).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          ) : (
            "Hover a priority bar to see which domains contribute."
          )}
        </div>

      </section>

      {/* ================= LIFECYCLE FLOW ================= */}

      <section className="analytics-card">

        <h3>Lifecycle Flow</h3>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={lifecycleChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a30" />
            <XAxis dataKey="name" stroke="#8fa88b" />
            <YAxis stroke="#8fa88b" />
            <Bar
              dataKey="value"
              fill="#809b87"
              radius={[10, 10, 0, 0]}
              onMouseEnter={(data) => setHoverLifecycle(data.name)}
              onMouseLeave={() => setHoverLifecycle(null)}
            />
          </BarChart>
        </ResponsiveContainer>

        <div className="hover-details">
          {hoverLifecycle ? (
            <>
              <strong>{hoverLifecycle}</strong> stage contains:
              <ul>
                {getLifecycleBreakdown(hoverLifecycle).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          ) : (
            "Hover a lifecycle bar to inspect domain distribution."
          )}
        </div>

      </section>

    </div>
  );
}