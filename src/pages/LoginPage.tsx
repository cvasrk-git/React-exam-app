import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";

const API_BASE_URL = "http://localhost:5000"; // Backend URL

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const endpoint = isLogin ? "/login" : "/register";
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        email,
        password,
      });

      if (isLogin) {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify({ email }));
          navigate("/login-success");
        }
      } else {
        setSuccessMessage("Registration successful! Please login.");
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>{isLogin ? "Login" : "Register"}</h2>
        
        {successMessage && (
          <p className={styles.successMessage}>{successMessage}</p>
        )}
        
        <form onSubmit={handleSubmit}>
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

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.inputField}
              required
            />
          )}

          <button 
            type="submit" 
            className={styles.loginButton} 
            disabled={loading}
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
          </button>
        </form>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.switchMode}>
          {isLogin ? (
            <p>
              Don't have an account?{" "}
              <button 
                className={styles.switchButton}
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setSuccessMessage("");
                }}
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button 
                className={styles.switchButton}
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setSuccessMessage("");
                }}
              >
                Login here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
