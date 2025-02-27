import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/LoginSuccess.module.css";

interface ExamResult {
  id: number;
  score: number;
  grade: string;
  status: string;
  timestamp: string;
  subject: string;
  total_questions: number;
  correct_answers: number;
}

interface DashboardData {
  lastExamScore: number;
  totalExams: number;
  averageScore: number;
  recentResults: ExamResult[];
}

const LoginSuccess: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    lastExamScore: 0,
    totalExams: 0,
    averageScore: 0,
    recentResults: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/get_results", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const results = response.data.results || [];
        
        // Calculate dashboard metrics
        const totalExams = results.length;
        const lastExamScore = results[0]?.score || 0;
        const averageScore = 
          results.reduce((sum: number, result: ExamResult) => sum + result.score, 0) / 
          (totalExams || 1);

        setDashboardData({
          lastExamScore,
          totalExams,
          averageScore: Math.round(averageScore * 100) / 100,
          recentResults: results.slice(0, 5), // Get last 5 results
        });
      } catch (err: any) {
        console.error("Error fetching results:", err);
        if (err.response?.status === 401) {
          // If unauthorized, redirect to login
          navigate("/login");
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleStartExam = () => {
    navigate("/topics"); // This is correct as it maps to ExamPage in App.tsx
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <header className={styles.header}>
        <h1>Exam Portal</h1>
        <div className={styles.userInfo}>
          <span>Welcome, {user.email || "User"}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.contentSection}>
        <nav className={styles.sideMenu}>
          <ul>
            <li>
              <button className={styles.activeMenu}>Dashboard</button>
            </li>
            <li>
              {/* Update the button to be more prominent */}
              <button 
                onClick={handleStartExam}
                className={`${styles.examButton} ${styles.primaryButton}`}
              >
                Take Exam
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/results")}>View Results</button>
            </li>
            <li>
              <button onClick={() => navigate("/profile")}>Profile</button>
            </li>
          </ul>
        </nav>

        <main className={styles.mainContent}>
          {error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : (
            <>
              <div className={styles.welcomeCard}>
                <h2>Your Dashboard</h2>
                <div className={styles.quickStats}>
                  <div className={styles.statCard}>
                    <h3>Last Exam Score</h3>
                    <p>{dashboardData.lastExamScore}%</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>Exams Taken</h3>
                    <p>{dashboardData.totalExams}</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>Average Score</h3>
                    <p>{dashboardData.averageScore}%</p>
                  </div>
                </div>
              </div>

              <div className={styles.recentResults}>
                <h3>Recent Exam Results</h3>
                <table className={styles.resultsTable}>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Grade</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentResults.map((result) => (
                      <tr key={result.id}>
                        <td>{result.subject || 'N/A'}</td>
                        <td>{result.score}%</td>
                        <td>{result.grade}</td>
                        <td>{result.status}</td>
                        <td>{new Date(result.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default LoginSuccess;
