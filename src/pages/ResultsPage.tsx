import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/PageStyles.module.css";

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure safe defaults
  const state = location.state || {};
  const answers = state.answers || {};
  const questions = Array.isArray(state.questions) ? state.questions : [];
  const validationResults = state.validation || {};

  const [score, setScore] = useState(0);
  const [grade, setGrade] = useState("");
  const [showDetails, setShowDetails] = useState(false); // Toggle for detailed results

  useEffect(() => {
    if (questions.length === 0 || Object.keys(answers).length === 0) return;

    let correctAnswers = 0;
    const totalQuestions = questions.length;

    questions.forEach((q) => {
      const userAnswer = answers[q.id] || "";
      const correctAnswer = q.correct_answer || "";

      if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
        correctAnswers += 1;
        validationResults[q.id] = { status: "Correct" };
      } else {
        validationResults[q.id] = { status: "Incorrect" };
      }
    });

    const accuracy = (correctAnswers / totalQuestions) * 100;
    setScore(accuracy);

    // Assign grade based on accuracy
    if (accuracy >= 90) setGrade("A+");
    else if (accuracy >= 80) setGrade("A");
    else if (accuracy >= 70) setGrade("B");
    else if (accuracy >= 60) setGrade("C");
    else if (accuracy >= 50) setGrade("D");
    else setGrade("F");
  }, [questions, answers, validationResults]);

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
      <div className={styles.resultsContent}>
        <h2 className={styles.title}>🎉 Test Results 🎉</h2>
        <h3 className={styles.grade}>
          Your Grade: {grade} ({score.toFixed(2)}%)
        </h3>

        <button className={styles.button} onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? "Hide Detailed Results" : "View Detailed Results"}
        </button>

        {/* Wrapper for maintaining structure even when table is hidden */}
        <div className={styles.resultsWrapper}>
          {showDetails && (
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Your Answer</th>
                  <th>Correct Answer</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => {
                  const userAnswer = answers[q.id] || "No answer";
                  const correctAnswer = q.correct_answer || "No answer";
                  const result = validationResults[q.id]?.status || "Incorrect";

                  return (
                    <tr
                      key={q.id}
                      className={result === "Correct" ? styles.correctRow : styles.wrongRow}
                    >
                      <td>{q.question}</td>
                      <td>{userAnswer}</td>
                      <td>{correctAnswer}</td>
                      <td>{result === "Correct" ? "✅ Correct" : "❌ Incorrect"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <button className={styles.button} onClick={() => navigate("/")}>
          Retry Test
        </button>
      </div>
    </div>
  );
};

export default ResultsPage;
