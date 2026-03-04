import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
 PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid   
} from "recharts";
import {
  LayoutDashboard,
  AlertTriangle,
  BarChart3,
  Sun,
  Moon,
  Menu
} from "lucide-react";

export default function AdminDashboard({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const [counts, setCounts] = useState({
    total: 0,
    open: 0,
    inReview: 0,
    resolved: 0,
  });

  const [issues, setIssues] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [priorityData, setPriorityData] = useState([]); 

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://127.0.0.1:8000/api/issues/admin-dashboard/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())  
      .then((data) => {
        if (!data.lifecycle_totals) return;

        setCounts({
          total: data.total_issues,
          open: data.lifecycle_totals.open,
          inReview: data.lifecycle_totals.in_review,
          resolved: data.lifecycle_totals.resolved,
        });

        // 🔹 CATEGORY FROM domains
        const formattedCategory = data.domains.map((domain) => ({
          name: domain.name.toUpperCase(),
          value: domain.total,
        }));

        setCategoryData(formattedCategory);

        // 🔹 PRIORITY FROM priority_totals
        const formattedPriority = Object.entries(data.priority_totals).map(
          ([key, value]) => ({
            name: key.toUpperCase(),
            value: value,
          })
        );

        setPriorityData(formattedPriority);
        fetch("http://127.0.0.1:8000/api/issues/recent/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((recentData) => {
            setIssues(recentData);
          });



        // 🔹 If you removed recent_issues from backend,
        // then this will remain empty
        // Otherwise:
        // setIssues(data.recent_issues || []);
        setIssues(data.recent_issues || []);
        setLoading(false);
      });

  //     const formattedCategory = data.category_distribution.map((item) => ({
  //       name: item.category.toUpperCase(),
  //       value: item.count,
  //     }));

  //     const formattedPriority = data.priority_distribution.map((item) => ({
  //       name: item.priority.toUpperCase(),
  //       value: item.count,
  //     }));

  //     setCategoryData(formattedCategory);
  //     setPriorityData(formattedPriority);   // 👈 THIS LINE

  //     setIssues(data.recent_issues);
  //     setLoading(false);
   //});
   }, [navigate]);

  useEffect(() => {
  const handleIssueUpdate = () => {
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/api/issues/admin-dashboard/", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCounts({
        total: data.total_issues,
        open: data.lifecycle_totals.open,
        inReview: data.lifecycle_totals.in_review,
        resolved: data.lifecycle_totals.resolved,
      });
        // CATEGORY FROM domains
        const formattedCategory = data.domains.map((domain) => ({
          name: domain.name.toUpperCase(),
          value: domain.total,
        }));

        setCategoryData(formattedCategory);

        // PRIORITY FROM priority_totals
        const formattedPriority = Object.entries(data.priority_totals).map(
          ([key, value]) => ({
            name: key.toUpperCase(),
            value: value,
          })
        );

        setPriorityData(formattedPriority);
      })
      .catch((err) => {
        console.error("Realtime update error:", err);
      });
  };

  window.addEventListener("issuesUpdated", handleIssueUpdate);

  return () => {
    window.removeEventListener("issuesUpdated", handleIssueUpdate);
  };
}, []);
useEffect(() => {
  const token = localStorage.getItem("access");
  if (!token) return;

  fetch("http://127.0.0.1:8000/api/issues/recent/", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      setIssues(data);
    })
    .catch((err) => {
      console.error("Recent issues error:", err);
    });
}, []);

  const COLORS = ["#5e7261", "#7f9182", "#445c49", "#9cad9e"];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div style={{ padding: "60px", color: "#aaa" }}>
        Loading InsightBridge Intelligence...
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="logo-section">
          <h2>InsightBridge</h2>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            ☰
          </button>
        </div>

        <nav className="sidebar-nav">
          <div
            className="nav-item active"
            onClick={() => navigate("/admin-dashboard")}
          >
            <LayoutDashboard size={18} />
            {!collapsed && <span>Dashboard</span>}
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/admin-issues")}
          >
            <AlertTriangle size={18} />
            {!collapsed && <span>Issues</span>}
          </div>

          <div
            className="nav-item"
            onClick={() => navigate("/admin-analytics")}
          >
            <BarChart3 size={18} />
            {!collapsed && <span>Analytics</span>}
          </div>
        </nav>

        <button
          className="mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && (
            <span style={{ marginLeft: "8px" }}>
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </button>
      </aside>


      {/* Main */}
      <main className="main-content">
        <div className="top-bar">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="subtitle">
              System Intelligence Overview
            </p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* STAT CARDS */}
<div className="stats-grid">
  {[
    { label: "Total", value: counts.total, filter: "all" },
    { label: "Open", value: counts.open, filter: "open" },
    { label: "In Review", value: counts.inReview, filter: "in_review" },
    { label: "Resolved", value: counts.resolved, filter: "resolved" },
  ].map((stat, i) => (
    <div
      key={i}
      className="stat-card clickable"
      style={{
        transition: "all 0.3s ease",
      }}
      onClick={() =>
        stat.filter === "all"
          ? navigate("/admin-issues")
          : navigate(`/admin-issues?filter=${stat.filter}`)
      }
    >
      <p>{stat.label}</p>
      <h2>{stat.value}</h2>
      <div
        style={{
          height: "4px",
          marginTop: "12px",
          borderRadius: "4px",
          background:
            "linear-gradient(to right, #5e7261, transparent)",
        }}
      />
    </div>
  ))}
</div>

        {/* ANALYTICS SECTION */}
        <div
          className="glass-card"
          style={{
            padding: "40px",
            marginTop: "30px",
          }}
        >
          <h3 style={{ marginBottom: "30px" }}>
            Category Intelligence
          </h3>

          <div
            style={{
              display: "flex",
              gap: "40px",
              alignItems: "center",
            }}
          >
            {/* CHART */}
            <div style={{ width: "50%", position: "relative" }}>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={130}
                    dataKey="value"
                    activeIndex={activeIndex}
                    activeOuterRadius={145}
                    onMouseEnter={(_, index) =>
                      setActiveIndex(index)
                    }
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[index % COLORS.length]
                        }
                        style={{
                          transition: "all 0.4s ease",
                          filter:
                            index === activeIndex
                              ? "brightness(1.2)"
                              : "brightness(1)",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </Pie>
                  

                  <Tooltip
                    formatter={(value, name) => [
                      `${value} Issues`,
                      name,
                    ]}
                    contentStyle={{
                      background:
                        "rgba(30,30,30,0.85)",
                      border:
                        "1px solid rgba(255,255,255,0.1)",
                      backdropFilter: "blur(12px)",
                      borderRadius: "14px",
                      padding: "10px 16px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* CENTER DISPLAY */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform:
                    "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#888",
                  }}
                >
                  Total Issues
                </div>
                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "600",
                  }}
                >
                  {counts.total}
                </div>
              </div>
            </div>

            {/* LEGEND PANEL */}
            <div style={{ width: "40%" }}>
              {categoryData.map((item, index) => {
                const percent = (
                  (item.value /
                    (counts.total || 1)) *
                  100
                ).toFixed(0);

                const isActive =
                  index === activeIndex;

                return (
                  <div
                    key={index}
                    onMouseEnter={() =>
                      setActiveIndex(index)
                    }
                    onMouseLeave={() =>
                      setActiveIndex(null)
                    }
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      padding: "14px 18px",
                      marginBottom: "12px",
                      borderRadius: "14px",
                      background: isActive
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                      transition:
                        "all 0.3s ease",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          background:
                            COLORS[
                              index %
                                COLORS.length
                            ],
                        }}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <div>{item.value}</div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#888",
                        }}
                      >
                        {percent}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
       {/* OPERATIONAL RISK INTELLIGENCE */}
<div
  className="glass-card"
  style={{
    padding: "45px",
    marginTop: "45px",
  }}
>
  <h3 style={{ marginBottom: "6px" }}>
    Operational Risk Intelligence
  </h3>

  <p
    style={{
      fontSize: "13px",
      color: "#8f968f",
      marginBottom: "30px",
      maxWidth: "520px",
    }}
  >
    Real-time distribution of active issues categorized by
    operational impact level across the platform.
  </p>

  {(() => {
    const orderedData = [
      priorityData.find(p => p.name === "LOW"),
      priorityData.find(p => p.name === "MEDIUM"),
      priorityData.find(p => p.name === "HIGH"),
    ].filter(Boolean);

    const highCount =
      orderedData.find(p => p.name === "HIGH")?.value || 0;

    const mediumCount =
      orderedData.find(p => p.name === "MEDIUM")?.value || 0;

    let systemStatus = "System Stable";
    let statusDescription =
      "Operational performance is within expected thresholds.";

    if (highCount > 0) {
      systemStatus = "Critical Attention Required";
      statusDescription =
        "High severity issues are affecting core system stability.";
    } else if (mediumCount > 0) {
      systemStatus = "Moderate Monitoring";
      statusDescription =
        "Medium severity disruptions impacting specific workflows.";
    }

    const PRIORITY_COLORS = {
      LOW: "#9cad9e",
      MEDIUM: "#6e8574",
      HIGH: "#445c49",
    };

    return (
      <>
        {/* BAR CHART */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={orderedData}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="name"
              stroke="#6f756f"
              tick={{ fill: "#a0a6a1", fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              stroke="#6f756f"
              tick={{ fill: "#a0a6a1", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(value, name) => [
                `${value} Active Issues`,
                `${name} Severity`,
              ]}
              contentStyle={{
                background: "rgba(15,18,15,0.98)",
                border: "1px solid rgba(120,140,110,0.25)",
                borderRadius: "14px",
                padding: "12px 16px",
              }}
              labelStyle={{
                color: "#e8efe9",
                fontWeight: 600,
              }}
              itemStyle={{
                color: "#cdd6cf",
                fontSize: "13px",
              }}
              cursor={{ fill: "rgba(120,140,110,0.06)" }}
            />


            <Bar
              dataKey="value"
              radius={[12, 12, 6, 6]}
              animationDuration={900}
            >
              {orderedData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={PRIORITY_COLORS[entry.name]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* STATUS PANEL */}
        <div
          style={{
            marginTop: "28px",
            padding: "18px 22px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: "600",
              marginBottom: "6px",
              color:
                highCount > 0
                  ? "#445c49"
                  : mediumCount > 0
                  ? "#6e8574"
                  : "#9cad9e",
            }}
          >
            {systemStatus}
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#8f968f",
            }}
          >
            {statusDescription}
          </div>
        </div>

        {/* SEVERITY EXPLANATION */}
        <div
          style={{
            marginTop: "30px",
            paddingTop: "18px",
            borderTop:
              "1px solid rgba(255,255,255,0.05)",
            display: "grid",
            gap: "10px",
            fontSize: "13px",
            color: "#8f968f",
          }}
        >
          <div>
            <strong style={{ color: "#9cad9e" }}>
              Low Impact
            </strong>{" "}
            — Minor UI inconsistencies, cosmetic bugs,
            or non-blocking enhancements.
          </div>

          <div>
            <strong style={{ color: "#6e8574" }}>
              Medium Impact
            </strong>{" "}
            — Workflow interruptions affecting
            certain user segments or features.
          </div>

          <div>
            <strong style={{ color: "#445c49" }}>
              High Impact
            </strong>{" "}
            — Critical system-level disruptions
            requiring immediate resolution.
          </div>
        </div>
      </>
    );
  })()}
</div>


        {/* RECENT ISSUES */}
        <div
          className="glass-card"
          style={{
            padding: "30px",
            marginTop: "30px",
          }}
        >
          <h3>Recent Activity</h3>

          {(Array.isArray(issues) ? issues : []).map((issue) => (
            <div
              key={issue.id}
              style={{
                padding: "16px",
                borderBottom:
                  "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              <strong>{issue.title}</strong>
              <div
                style={{
                  fontSize: "13px",
                  color: "#aaa",
                  marginTop: "6px",
                }}
              >
                {issue.status.toUpperCase()} •{" "}
                {issue.category.toUpperCase()} •{" "}
                {issue.priority.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
