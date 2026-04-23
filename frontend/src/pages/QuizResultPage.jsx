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

    const scorePercent = result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0;
    const passedWithDistinction = scorePercent > 70;

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold text-gray-900">Quiz Completed</h1>
            <div className={`rounded-2xl border p-6 shadow-sm ${passedWithDistinction ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <p className={`font-semibold text-lg ${passedWithDistinction ? "text-emerald-700" : "text-amber-800"}`}>
                    {passedWithDistinction ? "Congratulations! Great work on your quiz." : "Keep going. You can improve on your next attempt."}
                </p>
                <p className={`mt-2 text-sm ${passedWithDistinction ? "text-emerald-900" : "text-amber-900"}`}>
                    {passedWithDistinction
                        ? "You scored more than 70%, which is an excellent result."
                        : "You did not reach 70% yet, but another attempt can help you improve."}
                </p>
            </div>

            <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
                <p className="text-emerald-700 font-semibold text-lg">{result.quizTitle}</p>
                <p className="mt-4 text-gray-800">Score: <span className="font-bold">{result.score} / {result.totalMarks}</span></p>
                <p className="text-gray-700">Correct Answers: {result.correctAnswers}</p>
                <p className="text-gray-700">Wrong Answers: {result.wrongAnswers}</p>
                <p className="text-gray-700">Attempt Date: {result.attemptDate}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        to={`/quiz/modules/${moduleId}/quizzes/${result.quizId}/attempt`}
                        className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700"
                    >
                        Attempt Again
                    </Link>
                    <Link
                        to={`/quiz/modules/${moduleId}/quizzes`}
                        className="inline-block bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700"
                    >
                        Back to Module
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default QuizResultPage;
