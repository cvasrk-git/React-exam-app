import React from "react";
import styles from "./QuestionCard.module.css";

interface QuestionCardProps {
  question: {
    question: string;
    options: string[];
  };
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedAnswer, onSelectAnswer }) => {
  return (
    <div className={styles.card}>
      <p className={styles.question}>{question.question}</p>
      <div className={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <label key={index} className={styles.option}>
            <input
              type="radio"
              name="answer"
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onSelectAnswer(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};
export default QuestionCard;
