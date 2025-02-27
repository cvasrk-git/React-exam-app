import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Question from "../components/Question";

const API_BASE_URL = "http://localhost:5000"; // Backend API URL

const ExamPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [cachedQuestions, setCachedQuestions] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user.userId) {
      navigate("/"); // Redirect to login if user not found
    }
  }, [user, navigate]);

  const fetchQuestions = () => {
    if (!prompt.trim()) {
      setError("❌ Please enter a test topic.");
      return;
    }

    if (cachedQuestions) {
      setQuestions(cachedQuestions);
      setExamStarted(true);
      return;
    }

    setLoading(true);
    setError("");

    fetch(`${API_BASE_URL}/generate_questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, user_id: user.userId }), // Include user_id
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.questions)) {
          throw new Error("❌ Invalid API response format");
        }

        setCachedQuestions(data.questions);
        setQuestions(data.questions);
        initializeTimers(data.questions);
        setExamStarted(true);
      })
      .catch((err) => {
        console.error("🚨 Error fetching questions:", err);
        setError("⚠️ API error. Using fallback questions.");
        setExamStarted(true);
      })
      .finally(() => setLoading(false));
  };

  const initializeTimers = (questionList) => {
    const initialTimers = {};
    questionList.forEach((q) => (initialTimers[q.id] = 30));
    setTimers(initialTimers);
  };

  useEffect(() => {
    if (!examStarted || !questions.length) return;

    const questionId = questions[currentQuestionIndex]?.id;
    if (!questionId) return;

    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const newTimers = { ...prevTimers };
        if (newTimers[questionId] > 0) {
          newTimers[questionId] -= 1;
        }
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, examStarted, questions]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert("⚠️ You haven't answered any questions.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/validate_answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.userId, // Include user_id
          answers: answers,
          questions: questions,
        }),
      });

      if (!response.ok) throw new Error(`❌ Server error: ${response.status}`);

      const result = await response.json();

      navigate("/results", {
        state: { answers, questions, validation: result },
      });
    } catch (error) {
      console.error("🚨 Submission Error:", error);
      alert("⚠️ Submission failed. Please try again.");
    }
  };

  if (!examStarted) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>📝 Enter Your Test Topic</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your topic here..."
          style={{ width: "400px", height: "60px", padding: "10px" }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button onClick={fetchQuestions} disabled={loading}>
          {loading ? "⏳ Generating..." : "🚀 Start Exam"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <Question
        id={questions[currentQuestionIndex]?.id || ""}
        number={currentQuestionIndex + 1}
        total={questions.length}
        question={questions[currentQuestionIndex]}
        setAnswers={setAnswers}
        selectedAnswer={answers[questions[currentQuestionIndex]?.id] || ""}
        timeLeft={timers[questions[currentQuestionIndex]?.id] || 30}
      />
      <button disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}>
        Previous
      </button>
      <button disabled={currentQuestionIndex === questions.length - 1} onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}>
        Next
      </button>
      {currentQuestionIndex === questions.length - 1 && <button onClick={handleSubmit}>Submit</button>}
    </div>
  );
};

export default ExamPage;
