import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import QuestionCard from "../components/QuestionCard";

const API_BASE_URL = "http://localhost:5000"; // Backend API URL

const ExamTakingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const questions = location.state?.questions || [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!user.userId) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!questions || questions.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>❗ No Questions Found</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }));
  };

  const submitExam = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/validate_answers`, {
        user_id: user.userId, // Include user ID
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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Exam in Progress</h2>
      <QuestionCard 
        question={questions[currentQuestion]}
        selectedAnswer={answers[currentQuestion] || ""}
        onSelectAnswer={handleAnswer}
      />
      <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((prev) => prev - 1)}>Previous</button>
      <button disabled={currentQuestion === questions.length - 1} onClick={() => setCurrentQuestion((prev) => prev + 1)}>Next</button>
      {currentQuestion === questions.length - 1 && <button onClick={submitExam}>Submit</button>}
    </div>
  );
};

export default ExamTakingPage;
