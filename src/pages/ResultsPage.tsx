import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import styles from "../styles/ResultsPage.module.css";

interface ExamResult {
  correct_answers: number;
  grade: string;
  score: number;
  status: string;
  subject: string;
  total_questions: number;
  user_id: string;
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results as ExamResult;

  if (!results) {
    return (
      <Layout activeMenu="results">
        <div className={styles.resultsContainer}>
          <h2>No Results Available</h2>
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

  return (
    <Layout activeMenu="results">
      <div className={styles.resultsContainer}>
        <div className={styles.resultHeader}>
          <h2>Exam Results</h2>
          <span className={styles.subject}>{results.subject}</span>
        </div>

        <div className={styles.scoreCard}>
          <div className={`${styles.scoreCircle} ${getScoreColor(results.score)}`}>
            <span className={styles.scoreNumber}>{results.score}%</span>
            <span className={styles.scoreLabel}>Score</span>
          </div>

          <div className={styles.gradeContainer}>
            <div className={styles.gradeBox}>
              <span className={styles.gradeEmoji}>{getGradeEmoji(results.grade)}</span>
              <span className={styles.grade}>Grade {results.grade}</span>
            </div>
            <span className={`${styles.status} ${results.status === 'Passed' ? styles.passed : styles.failed}`}>
              {results.status}
            </span>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Correct Answers</span>
            <span className={styles.statValue}>{results.correct_answers}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Total Questions</span>
            <span className={styles.statValue}>{results.total_questions}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Accuracy</span>
            <span className={styles.statValue}>
              {((results.correct_answers / results.total_questions) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button 
            className={styles.retakeButton}
            onClick={() => navigate("/exam")}
          >
            Take Another Exam
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
