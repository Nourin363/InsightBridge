import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className={`admin-container ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="logo">InsightBridge</div>

        <nav>
          <button onClick={() => navigate("/admin-dashboard")}>
            Dashboard
          </button>
          <button>Issues</button>
          <button>Analytics</button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "→" : "←"}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
