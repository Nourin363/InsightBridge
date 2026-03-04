import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./auth/Login";
import Issues from "./pages/Issues";
import AdminDashboard from "./pages/AdminDashboard";
import AdminIssues from "./pages/AdminIssues";
import AdminAnalytics from "./pages/AdminAnalytics";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminExplainIssue from "./pages/AdminExplainIssue"

export default function App() {
  // Persistent theme state
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <div className={darkMode ? "dark" : "light"}>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/issues"
          element={
            <ProtectedRoute>
              <Issues />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-issues"
          element={
            <ProtectedRoute adminOnly>
              <AdminIssues />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-analytics"
          element={
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/explain/:id"
          element={<AdminExplainIssue />}
        />
      </Routes>
    </div>
  );
}
