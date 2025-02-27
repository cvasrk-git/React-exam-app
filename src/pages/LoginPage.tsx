import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";

const API_BASE_URL = "http://localhost:5000"; // Backend URL

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
  
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify({ email, userId: response.data.userId })); // Save user ID
        navigate("/login-success"); // Redirect to login success screen
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };    

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
            required
          />
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
