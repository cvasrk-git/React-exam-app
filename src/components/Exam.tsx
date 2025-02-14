import { useState } from "react";
import { getQuestions, validateAnswers } from "../services/api";
import Question from "./Question";
import Results from "./Results";

const Exam = () => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, string> | null>(null);
    const [subject, setSubject] = useState("Math");
    const [difficulty, setDifficulty] = useState("basic");
    const [type, setType] = useState("mcq");
    const [currentIndex, setCurrentIndex] = useState(0);

    const loadQuestions = async () => {
        try {
            const data = await getQuestions(subject, difficulty, type);
            setQuestions(data.questions);
            setAnswers({});
            setResults(null);
            setCurrentIndex(0); // Reset to first question
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < questions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }

        const questionMap: Record<string, string> = {};
        questions.forEach((q, index) => {
            questionMap[`q${index + 1}`] = q.question;
        });

        try {
            const validationData = await validateAnswers(answers, questionMap);
            setResults(validationData.validation);
        } catch (error) {
            console.error("Error validating answers:", error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Online Exam</h1>

            {/* Question Loader */}
            <div className="mb-4">
                <label>Difficulty:</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="basic">Basic</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <label>Subject:</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="Math">Math</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                </select>
                <label>Type:</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="mcq">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                </select>
                <button onClick={loadQuestions} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">Load Questions</button>
            </div>

            {/* Question Display */}
            {questions.length > 0 && (
                <div>
                    <Question
                        id={`q${currentIndex + 1}`}
                        number={currentIndex + 1}
                        total={questions.length}
                        question={questions[currentIndex]}
                        setAnswers={setAnswers}
                        selectedAnswer={answers[`q${currentIndex + 1}`] || ""}
                    />

                    {/* Navigation Buttons */}
                    <div className="mt-4">
                        {currentIndex > 0 && (
                            <button onClick={handlePrevious} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Previous</button>
                        )}
                        {currentIndex < questions.length - 1 ? (
                            <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
                        ) : (
                            <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">Submit</button>
                        )}
                    </div>
                </div>
            )}

            {/* Show Results After Submission */}
            {results && <Results results={results} />}
        </div>
    );
};

export default Exam;
