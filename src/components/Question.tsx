interface QuestionProps {
    id: string;
    number: number;
    total: number;
    question: { question: string; options: string[] };
    setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    selectedAnswer: string;
}

const Question = ({ id, number, total, question, setAnswers, selectedAnswer }: QuestionProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAnswers(prev => ({ ...prev, [id]: e.target.value }));
    };

    return (
        <div className="border p-4 mb-2 rounded">
            <p className="text-lg font-bold">
                Question {number} of {total}
            </p>
            <p className="font-semibold">{question.question}</p>
            {question.options.map((option, index) => (
                <label key={index} className="block">
                    <input type="radio" name={id} value={option} checked={selectedAnswer === option} onChange={handleChange} />
                    {option}
                </label>
            ))}
        </div>
    );
};

export default Question;
