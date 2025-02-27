import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import styles from "../styles/ExamTakingPage.module.css";
import { validateAnswers } from '../services/api';

interface Question {
  id: number;
  question: string;
  options?: string[];
  type: string;
  hint?: string;
  time_limit: number;
  correct_answer?: string;
}

const ExamTakingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!location.state?.questions) {
      navigate("/topics");
      return;
    }
    setQuestions(location.state.questions);
    setAnswers(new Array(location.state.questions.length).fill(""));
    setTimeLeft(location.state.questions[0].time_limit || 60);
  }, [location.state, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            return questions[currentQuestion + 1]?.time_limit || 60;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentQuestion, questions]);

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(questions[currentQuestion + 1]?.time_limit || 60);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setTimeLeft(questions[currentQuestion - 1]?.time_limit || 60);
      setShowHint(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Convert answers array to object with question IDs as keys
      const formattedAnswers = questions.reduce((acc, question, index) => {
        if (answers[index] !== undefined) {
          acc[question.id] = answers[index];
        }
        return acc;
      }, {} as Record<string, string>);

      // Validate that all questions have been answered
      const unansweredCount = questions.length - Object.keys(formattedAnswers).length;
      if (unansweredCount > 0) {
        const confirmSubmit = window.confirm(
          `You have ${unansweredCount} unanswered question(s). Do you want to submit anyway?`
        );
        if (!confirmSubmit) {
          setLoading(false);
          return;
        }
      }

      const results = await validateAnswers(formattedAnswers, questions);
      
      // Navigate to results page with the response data
      navigate('/results', {
        state: {
          results,
          questions,
          answers: formattedAnswers
        }
      });
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit exam');
    } finally {
      setLoading(false);
    }
  };

  if (!questions.length) return null;

  const currentQuestionData = questions[currentQuestion];

  // Add a guard clause to prevent rendering if currentQuestionData is undefined
  if (!currentQuestionData) return null;

  const renderAnswerInput = () => {
    if (!currentQuestionData) return null;

    switch (currentQuestionData.type) {
      case 'mcq':
      case 'true_false':
        return (
          <div className={styles.optionsGrid}>
            {currentQuestionData.options?.map((option, index) => (
              <button
                key={index}
                className={`${styles.optionButton} ${
                  answers[currentQuestion] === option ? styles.selectedOption : ''
                }`}
                onClick={() => {
                  const newAnswers = [...answers];
                  newAnswers[currentQuestion] = option;
                  setAnswers(newAnswers);
                }}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
        );

      case 'short_answer':
        return (
          <textarea
            className={styles.textAnswer}
            value={answers[currentQuestion] || ''}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }}
            placeholder="Type your answer here..."
            rows={3}
          />
        );

      case 'essay':
      case 'coding':
        return (
          <textarea
            className={styles.textAnswer}
            value={answers[currentQuestion] || ''}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }}
            placeholder={`Enter your ${currentQuestionData.type} answer here...`}
            rows={8}
          />
        );

      default:
        return (
          <textarea
            className={styles.textAnswer}
            value={answers[currentQuestion] || ''}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }}
            placeholder="Type your answer here..."
            rows={4}
          />
        );
    }
  };

  return (
    <Layout activeMenu="exam">
      <div className={styles.examContainer}>
        <div className={styles.examHeader}>
          <div className={styles.questionProgress}>
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className={styles.timer}>
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className={styles.questionCard}>
          <h3 className={styles.questionText}>{currentQuestionData?.question}</h3>
          
          {renderAnswerInput()}

          {currentQuestionData?.hint && (
            <div className={styles.hintSection}>
              <button
                className={styles.hintButton}
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
              {showHint && (
                <div className={styles.hintText}>
                  💡 {currentQuestionData.hint}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.navigationButtons}>
          <button
            className={`${styles.navButton} ${styles.previousButton}`}
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || loading}
          >
            ← Previous
          </button>
          {currentQuestion === questions.length - 1 ? (
            <button
              className={`${styles.navButton} ${styles.submitButton}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Exam'}
            </button>
          ) : (
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNext}
              disabled={loading}
            >
              Next →
            </button>
          )}
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExamTakingPage;
