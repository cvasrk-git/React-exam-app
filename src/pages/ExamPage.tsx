import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import for navigation
import Question from "../components/Question";

const ExamPage = () => {
  const [questions, setQuestions] = useState([]);
  const [cachedQuestions, setCachedQuestions] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [examStarted, setExamStarted] = useState(false);
  const navigate = useNavigate(); // ✅ Navigation hook

  const fallbackQuestions = [
    {
      id: "q1",
      question: "What is Java?",
      options: ["A programming language", "A coffee brand", "An island", "A car model"],
      type: "mcq",
    },
    {
      id: "q2",
      question: "Explain polymorphism in Java.",
      type: "text",
    },
  ];

  const fetchQuestions = () => {
    if (!prompt.trim()) {
      setError("❌ Please enter a prompt.");
      return;
    }

    if (cachedQuestions) {
      setQuestions(cachedQuestions);
      setExamStarted(true);
      return;
    }

    setLoading(true);
    setError("");

    fetch("http://localhost:5000/generate_questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, user_id: "test_user" }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`❌ HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("🔍 API Response:", data);

        if (!data || !data.questions || !Array.isArray(data.questions)) {
          throw new Error("❌ Invalid API response format");
        }

        setCachedQuestions(data.questions);
        setQuestions(data.questions);
        initializeTimers(data.questions);
        setExamStarted(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error("🚨 Error fetching questions:", err);

        setError("⚠️ API error. Using fallback questions.");
        setQuestions(fallbackQuestions);
        initializeTimers(fallbackQuestions);
        setExamStarted(true);
        setLoading(false);
      });
  };

  const initializeTimers = (questionList) => {
    const initialTimers = {};
    questionList.forEach((q) => {
      initialTimers[q.id] = 30;
    });
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

  /** ✅ Handle Exam Submission */
  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert("⚠️ You haven't answered any questions.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/validate_answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "test_user",
          name: "Cva", // Ensure this is included
          answers: answers,
          questions: questions,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`❌ Server error: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("✅ Submission Response:", result);
  
      // ✅ Debug: Log navigation data
      console.log("🔍 Navigating to Results Page with data:", {
        answers,
        questions,
        validation: result,
      });
  
      navigate("/results", {
        state: {
          answers: answers,
          questions: questions,
          validation: result, // Server-validated results
        },
      });
  
    } catch (error) {
      console.error("🚨 Submission Error:", error);
      alert("⚠️ Submission failed. Please try again.");
    }
  };  

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    textAlign: "center",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
  };

  if (!examStarted) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2>📝 Enter Exam Topic</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="border p-2 w-full mt-2"
            rows={3}
            style={{ width: "100%" }}
          />
          <br />
          <button onClick={fetchQuestions} className="border px-4 py-2 bg-blue-500 text-white rounded mt-3">
            Start Exam
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>📚 Exam Questions</h2>

        {questions.length > 0 && questions[currentQuestionIndex] ? (
          <Question
            id={questions[currentQuestionIndex]?.id || ""}
            number={currentQuestionIndex + 1}
            total={questions.length}
            question={questions[currentQuestionIndex]}
            setAnswers={setAnswers}
            selectedAnswer={answers[questions[currentQuestionIndex]?.id] || ""}
            timeLeft={timers[questions[currentQuestionIndex]?.id] || 30}
          />
        ) : (
          <p>⚠️ Error loading question.</p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          {currentQuestionIndex > 0 && (
            <button onClick={() => setCurrentQuestionIndex((prev) => prev - 1)} className="border px-4 py-2 bg-gray-300 rounded">
              Previous
            </button>
          )}

          {currentQuestionIndex < questions.length - 1 ? (
            <button onClick={() => setCurrentQuestionIndex((prev) => prev + 1)} className="border px-4 py-2 bg-blue-500 text-white rounded">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} className="border px-4 py-2 bg-green-500 text-white rounded">
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
