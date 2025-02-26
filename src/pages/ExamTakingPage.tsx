import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/PageStyles.module.css";
import QuestionCard from "../components/QuestionCard";

const API_BASE_URL = "http://localhost:5000"; // Update with your backend URL

const ExamTakingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions || [];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    console.log("🔍 Questions received:", questions);
    if (questions.length > 0) {
      console.log("✅ First Question:", questions[0]); 
    } else {
      console.error("❌ No questions loaded!");
    }
  }, [questions]);

  if (!questions || questions.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.cardContainer}>
          <h2 className={styles.title}>❗ No Questions Found</h2>
          <button className={styles.button} onClick={() => navigate("/")}>
            Go Back
          </button>
        </div>
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
      console.error("🚨 Error submitting exam:", error);
      alert("⚠️ Submission failed. Please try again.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.cardContainer}>
        <h2 className={styles.title}>Exam in Progress</h2>
        <QuestionCard 
          question={questions[currentQuestion]}
          selectedAnswer={answers[currentQuestion] || ""}
          onSelectAnswer={handleAnswer}
        />
  
        <div className={styles.buttonContainer}>
          {currentQuestion > 0 && (
            <button className={styles.button} onClick={prevQuestion}>Previous</button>
          )}
          {currentQuestion < questions.length - 1 && (
            <button className={styles.button} onClick={nextQuestion}>Next</button>
          )}
          {currentQuestion === questions.length - 1 && (
            <button className={styles.button} onClick={submitExam}>Submit</button>
          )}
        </div>
      </div>
    </div>
  );  
};

export default ExamTakingPage;
