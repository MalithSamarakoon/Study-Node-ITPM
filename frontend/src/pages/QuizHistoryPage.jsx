import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchAttemptHistory } from "../api/quizApi";

function QuizHistoryPage() {
    const location = useLocation();
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const load = async () => {
            const data = await fetchAttemptHistory();
            setHistory(data);
        };

        load();
    }, []);

    const title = useMemo(() => {
        if (location.pathname.endsWith("/attempts")) return "My Attempts";
        if (location.pathname.endsWith("/results")) return "My Results";
        return "Quiz History";
    }, [location.pathname]);

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {history.length === 0 && <p className="text-gray-500">No attempts yet.</p>}

            {history.map((item) => (
                <article key={item.attemptId} className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-indigo-900">{item.quizTitle}</h2>
                    <p className="text-sm text-gray-700 mt-2">Score: {item.score} / {item.totalMarks}</p>
                    <p className="text-sm text-gray-600">Attempt Date: {item.attemptDate}</p>
                    <Link
                        to={`/quiz/modules/0/results/${item.attemptId}`}
                        className="inline-block mt-4 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700"
                    >
                        View Result
                    </Link>
                </article>
            ))}
        </div>
    );
}

export default QuizHistoryPage;
