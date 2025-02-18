import React from "react";

interface QuestionProps {
  id: string;
  number: number;
  total: number;
  question: { question: string; options: string[] };
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers((prev) => ({ ...prev, [id]: e.target.value }));
  };

  return (
    <div className="border p-4 mb-2 rounded" style={{ maxWidth: '600px', margin: 'auto' }}>
      <p className="text-red-500">⏳ Time left: {timeLeft}s</p>
      <p className="text-lg font-bold">
        Question {number} of {total}
      </p>
      <p className="font-semibold">{question.question}</p>

      {/* Options displayed one per line */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '20px' }}>
        {question.options.map((option, index) => (
          <label key={index} className="optionItem">
            <input
              type="radio"
              name={id}
              value={option}
              checked={selectedAnswer === option}
              onChange={handleChange}
              style={{
                marginRight: '10px', // Space between radio button and option text
              }}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Question;
