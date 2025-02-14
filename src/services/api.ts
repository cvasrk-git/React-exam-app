import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export const getQuestions = async (subject: string, difficulty: string, type: string) => {
    const response = await axios.get(`${API_BASE_URL}/get_questions`, {
        params: { subject, difficulty, type }
    });
    return response.data;
};

export const validateAnswers = async (answers: Record<string, string>, questions: Record<string, string>) => {
    const response = await axios.post(`${API_BASE_URL}/validate_answers`, { answers, questions });
    return response.data;
};
