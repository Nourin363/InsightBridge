import { useEffect, useState } from "react";
import axios from "axios";

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access");

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
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/issues/create/",
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");
      setDescription("");
      setMessage("Issue submitted successfully!");
      fetchIssues(); // refresh list
    } catch (err) {
      console.error(err);
      setMessage("Error submitting issue.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Issues Dashboard</h1>

      {/* Create Issue Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Issue title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Describe the issue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={styles.textarea}
        />
        <button type="submit" style={styles.button}>
          Submit Issue
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <hr style={{ margin: "40px 0", opacity: 0.3 }} />

      {/* Issues List */}
      {issues.map((issue) => (
        <div key={issue.id} style={styles.card}>
          <h3>{issue.title}</h3>
          <p>{issue.description}</p>
          <p>
            Status:{" "}
            <span style={styles.status(issue.status)}>
              {issue.status}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    maxWidth: "800px",
    margin: "auto",
    color: "white",
  },
  heading: {
    textAlign: "center",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    background: "#2f3e55",
    padding: "25px",
    borderRadius: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    minHeight: "100px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#4ea1d3",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
  },
  card: {
    background: "#2f3e55",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  status: (status) => ({
    color:
      status === "open"
        ? "orange"
        : status === "in_review"
        ? "yellow"
        : "lightgreen",
    fontWeight: "bold",
  }),
};
