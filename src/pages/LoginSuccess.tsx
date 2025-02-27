import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/LoginSuccess.module.css";

const LoginSuccess: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleStartExam = () => {
    console.info("User ID: " + user.email);
    if (user.email) {
      navigate("/topics", { state: { userId: user.email } });
    } else {
      console.error("User ID not found!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Welcome, {user.email || "User"}!</h2>
        <p>You are successfully logged in.</p>

        <div className={styles.buttons}>
          <button onClick={() => navigate("/results")}>View Previous Results</button>
          <button onClick={handleStartExam}>Take New Exam</button>
          <button className={styles.logout} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccess;
