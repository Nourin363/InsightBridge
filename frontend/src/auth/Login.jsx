import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  console.log("LOGIN CLICKED");
  e.preventDefault();
  setError("");

  try {

    const res = await axios.post(
      "http://127.0.0.1:8000/api/token/",
      { username, password }
    );

    console.log("LOGIN SUCCESS");

    // Save token
    localStorage.setItem("token", res.data.access);

    // Now check if user is staff
    const userRes = await axios.get(
      "http://127.0.0.1:8000/api/issues/protected/",
      {
        headers: {
          Authorization: `Bearer ${res.data.access}`,
        },
      }
    );

    // Save staff status properly as string
    localStorage.setItem(
      "is_staff",
      userRes.data.is_staff ? "true" : "false"
    );

    console.log("STAFF STATUS:", userRes.data.is_staff);

    navigate("/admin-dashboard");

  }
  catch (error){

    console.log("LOGIN ERROR:", error);
    setError("Invalid username or password");

  }
};

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.card}>
        <h1 style={styles.logo}>InsightBridge</h1>
        <p style={styles.subtitle}>Transparent Issue Intelligence</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button}>Sign In</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, sans-serif",
    background: "#0f1115",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.04), transparent 60%)",
  },

  card: {
    position: "relative",
    width: "420px",
    padding: "50px 45px",
    background: "rgba(26, 29, 33, 0.9)",
    borderRadius: "18px",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
  },

  logo: {
    color: "#f3f4f6",
    fontSize: "30px",
    marginBottom: "6px",
    letterSpacing: "1px",
  },

  subtitle: {
    color: "#9ca3af",
    marginBottom: "35px",
    fontSize: "14px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #2a2f36",
    background: "#14171a",
    color: "#e5e7eb",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s ease",
  },

  button: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#2d3137",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  error: {
    color: "#ef4444",
    fontSize: "13px",
    marginBottom: "10px",
  },
};
