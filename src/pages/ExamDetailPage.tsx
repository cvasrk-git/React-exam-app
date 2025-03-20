import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import styles from '../styles/ExamDetailPage.module.css';

interface ExamDetail {
  id: string;
  subject: string;
  timestamp: string;
  score: number;
  grade: string;
  status: string;
  questions: {
    id: number;
    question: string;
    correct_answer: string;
    user_answer: string;
    options?: string[];
    type: string;
  }[];
}

const ExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExamDetail();
  }, [examId]);

  const fetchExamDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:5000/exam_detail/${examId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle case where questions might not be available
      const data = response.data;
      if (!data.questions) {
        data.questions = [];  // Provide empty array if no questions
      }

      setExamDetail(data);
    } catch (err) {
      console.error('Error fetching exam detail:', err);
      setError('Failed to load exam details');
    } finally {
      setLoading(false);
    }
  };

  const getAnswerStatus = (correct: string, user: string) => {
    return correct === user ? 'correct' : 'incorrect';
  };

  if (loading) {
    return (
      <Layout activeMenu="results">
        <div className={styles.container}>
          <div className={styles.loading}>Loading exam details...</div>
        </div>
      </Layout>
    );
  }

  if (error || !examDetail) {
    return (
      <Layout activeMenu="results">
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/results')}
          >
            Back to Results
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeMenu="results">
      <div className={styles.container}>
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/results')}
          >
            ← Back to Results
          </button>
          <h1>{examDetail?.subject} Exam Details</h1>
          <div className={styles.examInfo}>
            <p>Date: {examDetail?.timestamp ? new Date(examDetail.timestamp).toLocaleDateString() : 'N/A'}</p>
            <p>Score: {examDetail?.score}%</p>
            <p>Grade: {examDetail?.grade}</p>
            <p className={`${styles.status} ${examDetail?.status ? styles[examDetail.status.toLowerCase()] : ''}`}>
              {examDetail?.status}
            </p>
          </div>
        </div>

        <div className={styles.questionsContainer}>
          {examDetail?.questions && examDetail.questions.length > 0 ? (
            examDetail.questions.map((question, index) => (
              <div 
                key={question.id} 
                className={`${styles.questionCard} ${styles[getAnswerStatus(question.correct_answer, question.user_answer)]}`}
              >
                <h3>Question {index + 1}</h3>
                <p className={styles.questionText}>{question.question}</p>
                
                {question.options && (
                  <div className={styles.options}>
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className={`${styles.option} ${
                          option === question.correct_answer ? styles.correctOption :
                          option === question.user_answer ? styles.userOption : ''
                        }`}
                      >
                        {option}
                        {option === question.correct_answer && <span className={styles.correctMark}>✓</span>}
                        {option === question.user_answer && option !== question.correct_answer && 
                          <span className={styles.incorrectMark}>✗</span>}
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.answerSection}>
                  <div className={styles.answerBox}>
                    <strong>Your Answer:</strong>
                    <span className={`${styles.answer} ${styles[getAnswerStatus(question.correct_answer, question.user_answer)]}`}>
                      {question.user_answer}
                    </span>
                  </div>
                  <div className={styles.answerBox}>
                    <strong>Correct Answer:</strong>
                    <span className={`${styles.answer} ${styles.correct}`}>
                      {question.correct_answer}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noQuestions}>
              <p>No detailed question information available for this exam.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExamDetailPage;
