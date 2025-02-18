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
  const validationResults = state.validation || {}; // Ensure results are received

  const [score, setScore] = useState(0);
  const [ranking, setRanking] = useState("");

  useEffect(() => {
    if (questions.length === 0 || Object.keys(validationResults).length === 0) return;

    // Debug: Log validation results and answers
    console.log("Validation Results:", validationResults);
    console.log("Answers:", answers);

    // Calculate the score
    const totalQuestions = questions.length;
    let correctAnswers = 0;

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      const correctAnswer = q.correct_answer;

      // Check if the user's answer matches the correct answer
      if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
        correctAnswers += 1;
        validationResults[q.id] = { status: "Correct" }; // Set the status explicitly
      } else {
        validationResults[q.id] = { status: "Incorrect" };
      }
    });

    console.log("Total Questions:", totalQuestions);
    console.log("Correct Answers:", correctAnswers);

    // Calculate the accuracy
    const accuracy = (correctAnswers / totalQuestions) * 100;
    setScore(accuracy);

    // Assign ranking based on accuracy
    if (accuracy >= 90) setRanking("🔥 Legendary");
    else if (accuracy >= 75) setRanking("💎 Elite");
    else if (accuracy >= 50) setRanking("💪 Skilled");
    else setRanking("🚀 Rookie");
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
      <h2 className={styles.title}>🎉 Exam Results 🎉</h2>
      <h3 className={styles.rank}>
        Your Ranking: {ranking} ({score.toFixed(2)}%)
      </h3>

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

      <button className={styles.button} onClick={() => navigate("/")}>
        Retry Exam
      </button>
    </div>
  );
};

export default ResultsPage;
