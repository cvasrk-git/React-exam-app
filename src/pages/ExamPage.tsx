import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Question from "../components/Question";
import { v4 as uuidv4 } from "uuid"; // Importing UUID to generate unique user_id
import styles from "./ExamPage.module.css";

const API_BASE_URL = "http://localhost:5000"; // Backend API base URL

interface QuestionData {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
}

const ExamPage: React.FC = () => {
  const navigate = useNavigate();
  const [userId] = useState<string>(uuidv4()); // Generate a unique user ID

  // Get stored values or initialize empty
  const [selectedTechnology, setSelectedTechnology] = useState(localStorage.getItem("selectedTechnology") || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState(localStorage.getItem("selectedDifficulty") || "");
  const [selectedType, setSelectedType] = useState(localStorage.getItem("selectedType") || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  // 🟢 Fetch Questions from API
  const handleStartExam = async () => {
    if (!selectedTechnology || !selectedDifficulty || !selectedType) {
      setError("❗ Please select all fields before starting the exam.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Fetching questions...");
      const response = await axios.get(`${API_BASE_URL}/get_questions`, {
        params: {
          technology: selectedTechnology,
          difficulty: selectedDifficulty,
          type: selectedType,
          user_id: userId,
        },
      });

      if (response.data.questions && response.data.questions.length > 0) {
        setQuestions(response.data.questions);

        // Initialize Timers
        const initialTimes = response.data.questions.reduce((acc: Record<string, number>, question: QuestionData) => {
          acc[question.id] = 30;
          return acc;
        }, {});

        setTimeLeft(initialTimes);
      } else {
        setError("⚠️ No questions found. Please try again.");
      }
    } catch (err) {
      setError("❌ Error fetching questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Handle Exam Timer
  useEffect(() => {
    if (questions.length === 0) return;

    const questionId = questions[currentIndex]?.id;
    if (!questionId) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTimes) => {
        if (prevTimes[questionId] > 0) {
          return { ...prevTimes, [questionId]: prevTimes[questionId] - 1 };
        } else {
          clearInterval(timer);
          handleNext();
          return prevTimes;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, questions]);

  // 🟢 Navigation Functions
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  // 🟢 Submit Exam
  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/validate_answers`, {
        answers,
        questions,
        user_id: userId,
      });
  
      navigate("/results", { state: { answers, questions, validation: response.data.validation } }); // ✅ Correct keys
    } catch (error) {
      console.error("Error submitting exam:", error);
    }
  };

  return (
    <div className={styles.examContainer}>
      {/* 🟢 Exam Selection UI */}
      {!questions.length ? (
        <>
          <h2 className={styles.title}>⚡ Get Ready to Test Your Knowledge! ⚡</h2>

          {/* Technology Selection */}
          <label className={styles.label}>Select Technology:</label>
          <select
            value={selectedTechnology}
            onChange={(e) => {
              setSelectedTechnology(e.target.value);
              localStorage.setItem("selectedTechnology", e.target.value);
            }}
            className={styles.select}
          >
            <option value="">-- Choose Technology --</option>
            <option value="AI">Artificial Intelligence</option>
            <option value="ML">Machine Learning</option>
            <option value="Web">Web Development</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Cloud">Cloud Computing</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Data Science">Data Science</option>
          </select>

          {/* Difficulty Selection */}
          <label className={styles.label}>Select Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              setSelectedDifficulty(e.target.value);
              localStorage.setItem("selectedDifficulty", e.target.value);
            }}
            className={styles.select}
          >
            <option value="">-- Choose Difficulty --</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Question Type Selection */}
          <label className={styles.label}>Select Question Type:</label>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              localStorage.setItem("selectedType", e.target.value);
            }}
            className={styles.select}
          >
            <option value="">-- Choose Type --</option>
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="true_false">True/False</option>
            <option value="coding">Coding</option>
            <option value="short_answer">Short Answer</option>
          </select>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.startButton} onClick={handleStartExam} disabled={loading}>
            {loading ? "Questions Loading..." : "Start Test"}
          </button>
        </>
      ) : (
        // 🟢 Exam Questions UI
        <>
          <Question
            id={questions[currentIndex].id}
            number={currentIndex + 1}
            total={questions.length}
            question={questions[currentIndex]}
            setAnswers={setAnswers}
            selectedAnswer={answers[questions[currentIndex].id] || ""}
            timeLeft={timeLeft[questions[currentIndex].id]}
          />
          <div className={styles.navigationButtons}>
            {currentIndex > 0 && <button onClick={handlePrevious} className={styles.navButton}>Previous</button>}
            {currentIndex < questions.length - 1 ? (
              <button onClick={handleNext} className={styles.navButton}>Next</button>
            ) : (
              <button onClick={handleSubmit} className={styles.submitButton}>Submit</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExamPage;
