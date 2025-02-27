import React, { useState } from "react";

interface QuestionProps {
  id: string | number;
  number: number;
  total: number;
  question: {
    question: string;
    options?: string[];
    type: string;
    hint?: string;
    time_limit: number;
  };
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
  const [hintVisibility, setHintVisibility] = useState<Record<string, boolean>>({});

  const toggleHint = (questionId: string | number) => {
    setHintVisibility((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const renderAnswerInput = () => {
    switch (question.type) {
      case 'mcq':
        return (
          <div className="options-container">
            {question.options?.map((option, index) => (
              <label key={index} className="option-label">
                <input
                  type="radio"
                  name={`question-${id}`}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [id]: e.target.value }))}
                />
                {option}
              </label>
            ))}
          </div>
        );
      
      case 'true_false':
        // Always use True/False options for true_false type, regardless of what's in question.options
        return (
          <div className="options-container">
            {['True', 'False'].map((option) => (
              <label key={option} className="option-label">
                <input
                  type="radio"
                  name={`question-${id}`}
                  value={option}
                  checked={selectedAnswer === option}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [id]: e.target.value }))}
                />
                {option}
              </label>
            ))}
          </div>
        );
      
      case 'short_answer':
        return (
          <input
            type="text"
            value={selectedAnswer}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [id]: e.target.value }))}
            className="short-answer-input"
            placeholder="Type your answer here..."
          />
        );
      
      case 'coding':
      case 'essay':
        return (
          <textarea
            value={selectedAnswer}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [id]: e.target.value }))}
            className="long-answer-input"
            placeholder={`Type your ${question.type} answer here...`}
            rows={6}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="border p-4 mb-4 rounded shadow-md bg-white">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <p style={{ fontWeight: "bold", color: "#d9534f", fontSize: "16px" }}>
          ⏳ Time left: {timeLeft}s
        </p>
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

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          Question {number} of {total}
        </h3>
        <p className="text-gray-700">{question.question}</p>
      </div>

      {renderAnswerInput()}

      {hintVisibility[id] && question.hint && (
        <div className="mt-4 p-3 bg-yellow-100 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Hint:</strong> {question.hint}
          </p>
        </div>
      )}
    </div>
  );
};

export default Question;
