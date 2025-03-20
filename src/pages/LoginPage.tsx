import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/LoginPage.module.css";

const API_BASE_URL = "http://localhost:5000";

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      const payload = isLogin 
        ? { email, password }
        : { email, password, first_name: firstName, last_name: lastName };

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);

      if (isLogin) {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/login-success");
        }
      } else {
        setSuccessMessage("Registration successful! Please login.");
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
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
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className={styles.inputField}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {!isLogin && (
            <>
              <input
                type="text"
                className={styles.inputField}
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                className={styles.inputField}
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </>
          )}

          <input
            type="password"
            className={styles.inputField}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {!isLogin && (
            <input
              type="password"
              className={styles.inputField}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "Please wait..." : (isLogin ? "Login" : "Register")}
          </button>

          <div className={styles.switchMode}>
            <button
              type="button"
              className={styles.switchButton}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Need an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
