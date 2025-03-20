import { useState, useEffect } from "react";
import { getQuestions, validateAnswers } from "../services/api";
import Question from "./Question";
import Results from "./Results";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface QuestionType {
  id: number;
  question: string;
  type: string;
  options?: string[];
  hint?: string;
  time_limit: number;
  correct_answer?: string;
}

const Exam = () => {
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, string> | null>(null);
    const [subject, setSubject] = useState("Java");
    const [difficulty, setDifficulty] = useState("basic");
    const [type, setType] = useState("mixed");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const loadQuestions = async () => {
        setLoading(true);
        setError("");
        try {
            console.log('Fetching questions with:', { subject, difficulty, type });
            const data = await getQuestions(subject, difficulty, type);
            console.log('Received data:', data);

            if (data && Array.isArray(data.questions)) {
                setQuestions(data.questions);
                setAnswers({});
                setResults(null);
                setCurrentIndex(0);
            } else {
                throw new Error('Invalid question data format');
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            setError(error instanceof Error ? error.message : "Failed to load questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/submit_exam`,
                {
                    questions: questions,
                    answers: answers
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.exam_id) {
                // Redirect to exam detail page
                navigate(`/exam-detail/${response.data.exam_id}`);
            }
        } catch (error) {
            console.error('Error submitting exam:', error);
            setError('Failed to submit exam');
        }
    };

    // Debug logging
    useEffect(() => {
        console.log('Current questions:', questions);
        console.log('Current answers:', answers);
    }, [questions, answers]);

    return (
        <div className="exam-container">
            {loading ? (
                <div>Loading questions...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <>
                    <div className="exam-controls">
                        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                            <option value="Java">Java</option>
                            <option value="Python">Python</option>
                            <option value="JavaScript">JavaScript</option>
                        </select>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                            <option value="basic">Basic</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="mixed">Mixed</option>
                            <option value="mcq">Multiple Choice</option>
                            <option value="true_false">True/False</option>
                        </select>
                        <button onClick={loadQuestions}>Start Exam</button>
                    </div>

                    {questions.length > 0 ? (
                        <div className="questions-container">
                            {questions.map((question, index) => (
                                <Question
                                    key={question.id}
                                    id={question.id}
                                    number={index + 1}
                                    total={questions.length}
                                    question={question}
                                    setAnswers={setAnswers}
                                    selectedAnswer={answers[question.id] || ""}
                                    timeLeft={question.time_limit}
                                />
                            ))}
                            <button 
                                className="submit-button"
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length === 0}
                            >
                                Submit Exam
                            </button>
                        </div>
                    ) : (
                        <div className="no-questions">
                            Click "Start Exam" to begin
                        </div>
                    )}

                    {results && <Results results={results} />}
                </>
            )}
        </div>
    );
};

export default Exam;
