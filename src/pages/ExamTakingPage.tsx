import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/PageStyles.module.css";
import QuestionCard from "../components/QuestionCard";

const API_BASE_URL = "http://localhost:5000"; // Update your backend URL

const ExamTakingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions || [];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (questions.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <h2 className={styles.title}>❗ No Questions Found</h2>
        <button className={styles.button} onClick={() => navigate("/")}>
          Go Back
        </button>
      </div>
    );
  }

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
  };

  const nextQuestion = () => setCurrentQuestion(prev => Math.min(prev + 1, questions.length - 1));
  const prevQuestion = () => setCurrentQuestion(prev => Math.max(prev - 1, 0));

  const submitExam = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/validate_answers`, {
        answers,
        questions,
      });
      
      navigate("/results", { state: { answers, questions, validation: response.data.validation } });
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>Exam in Progress</h2>
      <QuestionCard 
        question={questions[currentQuestion]}
        selectedAnswer={answers[currentQuestion]}
        onSelectAnswer={handleAnswer}
      />

      <button className={styles.button} onClick={prevQuestion} disabled={currentQuestion === 0}>
        Previous
      </button>
      {currentQuestion < questions.length - 1 ? (
        <button className={styles.button} onClick={nextQuestion}>Next</button>
      ) : (
        <button className={styles.button} onClick={submitExam}>Submit</button>
      )}
    </div>
  );
};

export default ExamTakingPage;
