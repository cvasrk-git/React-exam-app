import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/PageStyles.module.css";

const API_BASE_URL = "http://localhost:5000"; // Backend URL

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, questions } = location.state || { answers: {}, questions: [] };

  const [results, setResults] = useState<Record<number, any>>({});
  const [score, setScore] = useState(0);
  const [ranking, setRanking] = useState("");

  useEffect(() => {
    if (questions.length === 0) return;

    const validateAnswers = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/validate_answers`, {
          answers,
          questions,
        });

        if (response.data.validation) {
          setResults(response.data.validation);
          
          // Calculate the score
          const totalQuestions = Object.keys(response.data.validation).length;
          const correctAnswers = Object.values(response.data.validation).filter(
            (result) => result.status === "Correct"
          ).length;

          const accuracy = (correctAnswers / totalQuestions) * 100;
          setScore(accuracy);

          // Assign ranking based on accuracy
          if (accuracy >= 90) setRanking("🏆 Expert");
          else if (accuracy >= 75) setRanking("🥇 Advanced");
          else if (accuracy >= 50) setRanking("🥈 Intermediate");
          else setRanking("🥉 Beginner");
        }
      } catch (error) {
        console.error("Error validating answers:", error);
      }
    };

    validateAnswers();
  }, [answers, questions]);

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
      <h3 className={styles.rank}>Your Ranking: {ranking} ({score.toFixed(2)}%)</h3>

      {questions.map((q, index) => {
        const result = results[q.id] || {};
        return (
          <div key={q.id} className={styles.resultItem}>
            <p><strong>Q{index + 1}:</strong> {q.question}</p>
            <p>
              <strong>Your Answer:</strong> 
              <span className={result.status === "Correct" ? styles.correct : styles.wrong}>
                {answers[q.id] || "No answer"}
              </span>
            </p>
            <p><strong>Correct Answer:</strong> {q.correct_answer}</p>
            <p><strong>Result:</strong> {result.status === "Correct" ? "✅ Correct" : "❌ Incorrect"}</p>
          </div>
        );
      })}

      <button className={styles.button} onClick={() => navigate("/")}>
        Retry Exam
      </button>
    </div>
  );
};

export default ResultsPage;
