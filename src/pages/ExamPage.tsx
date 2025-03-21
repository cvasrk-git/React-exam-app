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
  const [showInstructions, setShowInstructions] = useState(false);
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
            Enter the topic you would like to be tested on 
            <button 
              onClick={() => setShowInstructions(!showInstructions)}
              className={styles.instructionsLink}
            >
              {showInstructions ? '(Hide Instructions)' : '(Show Instructions)'}
            </button>
          </p>
          
          {showInstructions && (
            <div className={`${styles.promptInstructions} ${styles.slideDown}`}>
              <div className={styles.instructionsHeader}>
                <h3>How to Format Your Prompt</h3>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowInstructions(false)}
                >
                  ×
                </button>
              </div>
              <p>Your prompt should include:</p>
              <ul>
                <li><strong>Subject:</strong> Specify a subject (e.g., Python, JavaScript, Mathematics, Physics)</li>
                <li>
                  <strong>Difficulty Level:</strong> Include one of these words:
                  <ul>
                    <li><em>Basic:</em> For fundamental concepts (also: beginner, elementary, easy)</li>
                    <li><em>Intermediate:</em> For moderate difficulty (also: medium, regular)</li>
                    <li><em>Advanced:</em> For complex topics (also: expert, difficult, challenging)</li>
                  </ul>
                </li>
                <li>
                  <strong>Question Type:</strong> Specify one type:
                  <ul>
                    <li>"multiple choice" or "mcq"</li>
                    <li>"true/false"</li>
                    <li>"short answer"</li>
                    <li>"coding"</li>
                    <li>"essay"</li>
                  </ul>
                </li>
              </ul>
              <div className={styles.examplesSection}>
                <h4>Example Prompts:</h4>
                <ul className={styles.examples}>
                  <li>"Generate basic multiple choice questions about Python loops and conditionals"</li>
                  <li>"Create advanced coding questions about JavaScript promises and async/await"</li>
                  <li>"Make intermediate true/false questions about React components"</li>
                </ul>
              </div>
            </div>
          )}

          <textarea
            className={styles.topicInput}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              e.target.style.height = '70px';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            placeholder="Example: Generate intermediate multiple choice questions about JavaScript Arrays and Objects..."
            rows={3}
            style={{ width: '799px', height: '70px' }}
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
