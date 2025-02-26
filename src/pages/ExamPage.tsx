import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [showTextarea, setShowTextarea] = useState(false);
  const [showButton, setShowButton] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setShowTextarea(true), 300); // Show textarea after 300ms
    setTimeout(() => setShowButton(true), 800);   // Show button after 800ms
  }, []);

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
        setQuestions([
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
        ]);
        initializeTimers(questions);
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
          name: "Cva",
          answers: answers,
          questions: questions,
        }),
      });

      if (!response.ok) {
        throw new Error(`❌ Server error: ${response.status}`);
      }

      const result = await response.json();

      navigate("/results", {
        state: {
          answers: answers,
          questions: questions,
          validation: result,
        },
      });
    } catch (error) {
      console.error("🚨 Submission Error:", error);
      alert("⚠️ Submission failed. Please try again.");
    }
  };

  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start", // ⬅️ Aligns content to the top instead of center
    justifyContent: "center", // ⬅️ Centers horizontally
    height: "100vh",
    width: "100vw",
    paddingTop: "100px", // ⬅️ Adjust this value to move it lower/higher
  };
  
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    width: "100%", // Ensures it remains centered
  };  

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
  };

  if (!examStarted) {
    return (
      <div style={wrapperStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">📝 Enter Your Test Topic</h2>
            <p className="text-gray-600 mb-4">Provide a topic to generate relevant questions.</p>
  
            {/* ✅ 200px Wide Textarea with Scroll after 3 Lines */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your topic here..."
                className="w-[200px] min-h-[60px] max-h-[120px] p-3 border border-gray-300 rounded-xl shadow-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto transition-all duration-300 ease-in-out"
                style={{ lineHeight: "1.5", width: "400px"}}
                rows={3} // Shows 3 lines, scrolls after that
              />
            </div>
  
            {error && <p className="text-red-500 mt-2">{error}</p>}
  
            {/* ✅ Styled Button (Below Input) */}
            <div className="w-full mt-4">
              <button
                onClick={fetchQuestions}
                className="w-[200px] py-3 px-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md transition-transform transform hover:scale-105"
                disabled={loading}
              >
                {loading ? "⏳ Generating Questions..." : "🚀 Start Exam"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }      

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {questions.length > 0 && questions[currentQuestionIndex] ? (
          <>
            <Question
              id={questions[currentQuestionIndex]?.id || ""}
              number={currentQuestionIndex + 1}
              total={questions.length}
              question={questions[currentQuestionIndex]}
              setAnswers={setAnswers}
              selectedAnswer={answers[questions[currentQuestionIndex]?.id] || ""}
              timeLeft={timers[questions[currentQuestionIndex]?.id] || 30}
              hint={questions[currentQuestionIndex]?.hint || "No hint available"}
            />

            {/* ✅ Navigation Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
              {/* Previous Button */}
              {currentQuestionIndex > 0 && (
                <button 
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" 
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                >
                  Previous
                </button>
              )}

              {/* Next Button */}
              {currentQuestionIndex < questions.length - 1 && (
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                >
                  Next
                </button>
              )}

              {/* Submit Button (only on last question) */}
              {currentQuestionIndex === questions.length - 1 && (
                <button 
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" 
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          </>
        ) : (
          <p>⚠️ Error loading question.</p>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
