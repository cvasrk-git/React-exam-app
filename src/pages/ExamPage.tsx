import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./ExamPage.module.css";

const API_BASE_URL = "http://localhost:5000"; // Update your backend URL

const ExamPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTechnology, setSelectedTechnology] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        },
      });

      console.log("Response Data:", response.data);

      if (response.data.questions && response.data.questions.length > 0) {
        navigate("/exam", { state: { questions: response.data.questions } });
      } else {
        setError("⚠️ No questions found. Please try again.");
      }
    } catch (err) {
      setError("❌ Error fetching questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.examContainer}>
      <h2 className={styles.title}>⚡ Get Ready to Test Your Knowledge! ⚡</h2>

      {/* Technology Selection */}
      <label className={styles.label}>Select Technology:</label>
      <select
        value={selectedTechnology}
        onChange={(e) => setSelectedTechnology(e.target.value)}
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
        onChange={(e) => setSelectedDifficulty(e.target.value)}
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
        onChange={(e) => setSelectedType(e.target.value)}
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
    </div>
  );
};

export default ExamPage;
