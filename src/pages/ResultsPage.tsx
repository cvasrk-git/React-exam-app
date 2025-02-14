import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/PageStyles.module.css";

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, questions } = location.state || { answers: {}, questions: [] };

  if (questions.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <h2 className={styles.title}>❗ No Results Available</h2>
        <button className={styles.button} onClick={() => navigate("/")}>
          Retry Exam
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>🎉 Exam Results 🎉</h2>
      {questions.map((q, index) => (
        <div key={index} className={styles.resultItem}>
          <p><strong>Q{index + 1}:</strong> {q.question}</p>
          <p>Your Answer: <span className={answers[index] === q.correct ? styles.correct : styles.wrong}>
            {answers[index] || "No answer"}
          </span></p>
          
        </div>
      ))}
      <button className={styles.button} onClick={() => navigate("/")}>Retry Exam</button>
    </div>
  );
};

export default ResultsPage;
