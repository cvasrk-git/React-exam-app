import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import styles from "../styles/ResultsPage.module.css";

interface ExamResult {
  id: string;
  correct_answers: number;
  grade: string;
  score: number;
  status: string;
  subject: string;
  total_questions: number;
  user_id: string;
  timestamp: string;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:5000/get_results", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.results) {
        setResults(response.data.results);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load exam results");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return styles.excellent;
    if (score >= 70) return styles.good;
    if (score >= 50) return styles.average;
    return styles.poor;
  };

  const getGradeEmoji = (grade: string) => {
    switch (grade) {
      case 'A': return '🏆';
      case 'B': return '🌟';
      case 'C': return '👍';
      case 'D': return '📚';
      default: return '💪';
    }
  };

  if (loading) {
    return (
      <Layout activeMenu="results">
        <div className={styles.resultsContainer}>
          <div className={styles.loading}>Loading results...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout activeMenu="results">
        <div className={styles.resultsContainer}>
          <div className={styles.error}>{error}</div>
          <button 
            className={styles.retakeButton}
            onClick={() => navigate("/exam")}
          >
            Take New Exam
          </button>
        </div>
      </Layout>
    );
  }

  if (results.length === 0) {
    return (
      <Layout activeMenu="results">
        <div className={styles.resultsContainer}>
          <h2>No Results Available</h2>
          <p>You haven't taken any exams yet.</p>
          <button 
            className={styles.retakeButton}
            onClick={() => navigate("/exam")}
          >
            Take New Exam
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeMenu="results">
      <div className={styles.resultsContainer}>
        <h2>Exam Results History</h2>
        
        <div className={styles.resultsGrid}>
          {results.map((result) => (
            <div 
              key={result.id} 
              className={`${styles.resultCard} ${styles.clickable}`}
              onClick={() => navigate(`/exam-detail/${result.id}`)}
            >
              <div className={styles.resultHeader}>
                <h3>{result.subject}</h3>
                <span className={styles.timestamp}>
                  {new Date(result.timestamp).toLocaleDateString()}
                </span>
              </div>

              <div className={styles.scoreCard}>
                <div className={`${styles.scoreCircle} ${getScoreColor(result.score)}`}>
                  <span className={styles.scoreNumber}>{result.score}%</span>
                  <span className={styles.scoreLabel}>Score</span>
                </div>

                <div className={styles.gradeContainer}>
                  <div className={styles.gradeBox}>
                    <span className={styles.gradeEmoji}>{getGradeEmoji(result.grade)}</span>
                    <span className={styles.grade}>Grade {result.grade}</span>
                  </div>
                  <span className={`${styles.status} ${result.status === 'Passed' ? styles.passed : styles.failed}`}>
                    {result.status}
                  </span>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Correct Answers</span>
                  <span className={styles.statValue}>{result.correct_answers}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Total Questions</span>
                  <span className={styles.statValue}>{result.total_questions}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Accuracy</span>
                  <span className={styles.statValue}>
                    {((result.correct_answers / result.total_questions) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actionButtons}>
          <button 
            className={styles.retakeButton}
            onClick={() => navigate("/exam")}
          >
            Take New Exam
          </button>
          <button 
            className={styles.dashboardButton}
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ResultsPage;
