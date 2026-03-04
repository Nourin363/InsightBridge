import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminIssues.css";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom"

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState(null);

  // 🔥 NEW STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const token = localStorage.getItem("token");

  const fetchIssues = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/issues/list/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIssues(res.data);
    } catch (err) {
      console.error("Error fetching issues:", err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleUpdate = async (id, explanation, status) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/issues/explain/${id}/`,
        { explanation, status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchIssues();
      window.dispatchEvent(new Event("issuesUpdated"));

      setToast("Issue updated successfully");
      setTimeout(() => setToast(null), 2500);

    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  useEffect(() => {
    const urlFilter = searchParams.get("filter");
    setFilter(urlFilter || "all");
  }, [searchParams]);

  // 🔥 ADVANCED FILTERING LOGIC
  const filteredIssues = issues
    .filter((i) =>
      filter === "all" ? true : i.status === filter
    )
    .filter((i) =>
      categoryFilter === "all" ? true : i.category === categoryFilter
    )
    .filter((i) =>
      priorityFilter === "all" ? true : i.priority === priorityFilter
    )
    .filter((i) =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="admin-issues-container">
      <div className="admin-issues-header">
        <h1>Admin Issue Management</h1>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="performance">Performance</option>
            <option value="ui">UI</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {filteredIssues.length === 0 && (
        <div className="empty-state">
          <div className="empty-animation" />
          <h3>No Issues Found</h3>
          <p>Try adjusting filters or search criteria.</p>
        </div>
      )}

      {filteredIssues.map((issue) => (
        
        <div
          key={issue.id}
          className={`issue-card status-${issue.status}`}
        >
          <div className="issue-header">
            <div>
              <h3>{issue.title}</h3>
              <p className="description">{issue.description}</p>

              <div className="meta-row">
                <span className="badge category">
                  {issue.category.toUpperCase()}
                </span>

                <span className={`badge priority ${issue.priority}`}>
                  {issue.priority.toUpperCase()}
                </span>
              
                <span className="submitted-by">
                  Submitted by: {issue.created_by_username}
                </span>
              </div>
            </div>
            {/* Explain Button */}

            <div>

              <Link
                to={`/admin/explain/${issue.id}`}
                className="explain-btn"
              >
                Explain Issue
              </Link>

            </div>


            <div className="date">
              {new Date(issue.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="controls">
            <select
              value={issue.status}
              onChange={(e) =>
                handleUpdate(issue.id, issue.explanation, e.target.value)
              }
            >
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <textarea
            value={issue.explanation || ""}
            placeholder="Add admin explanation..."
            onChange={(e) =>
              handleUpdate(issue.id, e.target.value, issue.status)
            }
          />
        </div>
      ))}

      {toast && <div className="premium-toast">{toast}</div>}
    </div>
  );
}
