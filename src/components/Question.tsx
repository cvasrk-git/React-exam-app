import React, { useState } from "react";

interface QuestionProps {
  id: string;
  number: number;
  total: number;
  question: { question: string; options?: string[]; type: string; hint?: string };
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedAnswer: string;
  timeLeft: number;
}

const Question = ({
  id,
  number,
  total,
  question,
  setAnswers,
  selectedAnswer,
  timeLeft,
}: QuestionProps) => {
  // Maintain hint visibility per question
  const [hintVisibility, setHintVisibility] = useState<Record<string, boolean>>({});

  const toggleHint = (questionId: string) => {
    setHintVisibility((prev) => ({
      ...prev,
      [questionId]: !prev[questionId], // Toggle hint for this question only
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAnswers((prev) => ({ ...prev, [id]: e.target.value }));
  };

  return (
    <div className="border p-4 mb-4 rounded shadow-md bg-white" style={{ maxWidth: "600px", margin: "auto" }}>
      
      {/* Timer & Hint in Same Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        {/* Timer */}
        <p style={{ fontWeight: "bold", color: "#d9534f", fontSize: "16px" }}>
          ⏳ Time left: {timeLeft}s
        </p>

        {/* Hint Icon */}
        {question.hint && (
          <span
            onClick={() => toggleHint(id)}
            style={{
              cursor: "pointer",
              fontSize: "22px",
              color: hintVisibility[id] ? "orange" : "gray",
              transition: "color 0.3s ease",
            }}
            title="Click to show/hide hint"
          >
            💡
          </span>
        )}
      </div>

      {/* Hint Message (Shown only when clicked) */}
      {question.hint && hintVisibility[id] && (
        <p
          style={{
            backgroundColor: "#f9f9f9",
            padding: "8px",
            borderRadius: "5px",
            fontStyle: "italic",
            color: "#555",
            marginBottom: "10px",
            borderLeft: "4px solid orange",
          }}
        >
          {question.hint}
        </p>
      )}

      {/* Question */}
      <h3 style={{ fontWeight: "bold", fontSize: "18px" }}>
        Question {number}/{total}:
      </h3>
      <p style={{ fontSize: "16px", marginBottom: "10px" }}>{question.question}</p>

      {/* MCQ or True/False Options */}
      {question.options && (
        <div>
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setAnswers((prev) => ({ ...prev, [id]: option }))}
              style={{
                display: "block", // Shows options line by line
                width: "100%",
                padding: "10px",
                marginBottom: "8px",
                textAlign: "left",
                borderRadius: "5px",
                border: selectedAnswer === option ? "2px solid #007bff" : "1px solid #ccc",
                backgroundColor: selectedAnswer === option ? "#007bff" : "#f8f9fa",
                color: selectedAnswer === option ? "#fff" : "#333",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* Short Answer / Essay Input */}
      {!question.options && (
        <textarea
          value={selectedAnswer}
          onChange={handleChange}
          placeholder="Type your answer here..."
          className="border p-2 w-full mt-2"
          rows={3}
          style={{
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ccc",
            padding: "8px",
          }}
        />
      )}
    </div>
  );
};

export default Question;
