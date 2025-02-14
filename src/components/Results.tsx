interface ResultsProps {
    results: Record<string, string>;
}

const Results = ({ results }: ResultsProps) => {
    return (
        <div className="mt-4 p-4 border rounded">
            <h2 className="text-lg font-bold">Exam Results</h2>
            {Object.entries(results).map(([key, value]) => (
                <p key={key} className={value === "Correct" ? "text-green-600" : "text-red-600"}>
                    {key}: {value}
                </p>
            ))}
        </div>
    );
};

export default Results;
