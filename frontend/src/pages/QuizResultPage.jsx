import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAttemptResult } from "../api/quizApi";

function QuizResultPage() {
    const { moduleId, attemptId } = useParams();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const loadResult = async () => {
            const data = await fetchAttemptResult(attemptId);
            setResult(data);
        };

        loadResult();
    }, [attemptId]);

    if (!result) {
        return <p className="text-gray-600">Loading result...</p>;
    }

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Completed</h1>
            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                <p className="text-emerald-700 font-semibold text-lg">{result.quizTitle}</p>
                <p className="mt-4 text-gray-800">Score: <span className="font-bold">{result.score} / {result.totalMarks}</span></p>
                <p className="text-gray-700">Correct Answers: {result.correctAnswers}</p>
                <p className="text-gray-700">Wrong Answers: {result.wrongAnswers}</p>
                <p className="text-gray-700">Attempt Date: {result.attemptDate}</p>

                <Link
                    to={`/quiz/modules/${moduleId}/quizzes`}
                    className="inline-block mt-5 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700"
                >
                    Back to Module
                </Link>
            </div>
        </div>
    );
}

export default QuizResultPage;
