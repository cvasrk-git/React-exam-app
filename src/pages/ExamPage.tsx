import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import styles from "../styles/LoginSuccess.module.css";

interface Question {
  id: number;
  question: string;
  options: string[];
  type: string;
  hint?: string;
  time_limit: number;
}

const API_BASE_URL = "http://localhost:5000"; // Backend API URL

const ExamPage: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchQuestions = async () => {
    if (!prompt.trim()) {
      setError("Please enter a test topic.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/generate_questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received questions:", data); // Debug log

      if (!data || !Array.isArray(data.questions)) {
        throw new Error("Invalid API response format");
      }

      setQuestions(data.questions);
      
      // Navigate to exam taking page with questions
      navigate("/exam", { state: { questions: data.questions } });
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err instanceof Error ? err.message : "Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout activeMenu="exam">
      <div className={styles.welcomeCard}>
        <h2>Start New Exam</h2>
        <div className={styles.examSetup}>
          <p className={styles.instruction}>
            Enter the topic you would like to be tested on:
          </p>
          <textarea
            className={styles.topicInput}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              // Auto-resize textarea
              e.target.style.height = '70px'; // Default height
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`; // Limit max height
            }}
            placeholder="Example: JavaScript Arrays and Objects..."
            rows={3}
            style={{ width: '799px', height: '70px' }} // Added default style
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                fetchQuestions();
              }
            }}
          />
          {error && <div className={styles.errorMessage}>{error}</div>}
          <button 
            className={`${styles.examButton} ${styles.primaryButton}`}
            onClick={fetchQuestions}
            disabled={loading}
          >
            {loading ? "Generating Questions..." : "Start Exam"}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ExamPage;
