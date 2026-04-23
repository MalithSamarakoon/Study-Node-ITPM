import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchModuleLeaderboard, fetchModuleQuizzes, fetchModules } from "../api/quizApi";

function ModuleQuizListPage() {
    const { moduleId } = useParams();
    const [quizzes, setQuizzes] = useState([]);
    const [modules, setModules] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [quizData, moduleData] = await Promise.all([
                    fetchModuleQuizzes(moduleId),
                    fetchModules()
                ]);
                setQuizzes(quizData);
                setModules(moduleData);

                const leaderboardData = await fetchModuleLeaderboard(moduleId);
                setLeaderboard(leaderboardData);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [moduleId]);

    const moduleTitle = useMemo(() => {
        const current = modules.find((item) => String(item.id) === String(moduleId));
        return current?.title || "Module Quizzes";
    }, [modules, moduleId]);

    if (loading) {
        return <p className="text-gray-600">Loading module quizzes...</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{moduleTitle}</h1>
            {quizzes.map((quiz) => (
                <article key={quiz.id} className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-indigo-900">{quiz.title}</h2>
                    <p className="text-sm text-gray-600 mt-2">Duration: {quiz.duration} Minutes</p>
                    <p className="text-sm text-gray-600">Total Marks: {quiz.totalMarks}</p>
                    <p className="text-sm text-gray-700 mt-1">
                        Status: <span className="font-medium">{quiz.attempted ? "Completed" : "Not Attempted"}</span>
                    </p>

                    <div className="mt-4">
                        {quiz.attempted ? (
                            <Link
                                to={`/quiz/modules/${moduleId}/results/${quiz.latestAttemptId}`}
                                className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700"
                            >
                                View Result
                            </Link>
                        ) : (
                            <Link
                                to={`/quiz/modules/${moduleId}/quizzes/${quiz.id}/attempt`}
                                className="inline-block bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700"
                            >
                                Start Quiz
                            </Link>
                        )}
                    </div>
                </article>
            ))}

            <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-amber-900">Module Leaderboard</h2>
                        <p className="text-sm text-amber-800">Top performers in this module, ranked by best attempt percentage.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
                        Competitive view
                    </span>
                </div>

                {leaderboard.length === 0 ? (
                    <p className="text-sm text-amber-800">No attempts recorded for this module yet.</p>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.slice(0, 5).map((entry) => (
                            <div key={`${entry.studentId}-${entry.rank}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        #{entry.rank} {entry.studentName} <span className="text-gray-500">({entry.studentId})</span>
                                    </p>
                                    <p className="text-xs text-gray-500">Best attempt: {entry.quizTitle} on {entry.attemptDate}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-amber-700">{Math.round(entry.percentage)}%</p>
                                    <p className="text-xs text-gray-500">{entry.score} / {entry.totalMarks}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default ModuleQuizListPage;
