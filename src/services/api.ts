import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export const getQuestions = async (subject: string, difficulty: string, type: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/get_questions`, {
            params: { subject, difficulty, type }
        });
        
        // Add logging to debug the response
        console.log('API Response:', response.data);
        
        // Ensure we're returning the correct structure
        if (response.data && Array.isArray(response.data.questions)) {
            return response.data;
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error in getQuestions:', error);
        throw error;
    }
};

export const validateAnswers = async (answers: Record<string, string>, questions: any[]) => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await axios.post(
            `${API_BASE_URL}/validate_answers`,
            {
                answers,
                questions
            },
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error in validateAnswers:', error);
        throw error;
    }
};
