import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAttemptHistory } from "../api/quizApi";

const INITIAL_VISIBLE_ITEMS = 5;

function QuizHistoryPage() {
    const [history, setHistory] = useState([]);
    const [visibleItems, setVisibleItems] = useState(INITIAL_VISIBLE_ITEMS);

    useEffect(() => {
        const load = async () => {
            const data = await fetchAttemptHistory();
            setHistory(data);
        };

        load();
    }, []);

    const timeline = useMemo(() => {
        return [...history].sort((left, right) => {
            const leftDate = new Date(`${left.attemptDate}T00:00:00`);
            const rightDate = new Date(`${right.attemptDate}T00:00:00`);
            return leftDate - rightDate;
        });
    }, [history]);

    const stats = useMemo(() => {
        if (timeline.length === 0) {
            return null;
        }

        const percentages = timeline.map((item) => (
            item.totalMarks > 0 ? (item.score / item.totalMarks) * 100 : 0
        ));
        const bestPercentage = Math.max(...percentages);
        const averagePercentage = percentages.reduce((sum, value) => sum + value, 0) / percentages.length;
        const improvement = percentages[percentages.length - 1] - percentages[0];

        return {
            attempts: timeline.length,
            bestPercentage,
            averagePercentage,
            improvement
        };
    }, [timeline]);

    const visibleHistory = useMemo(() => history.slice(0, visibleItems), [history, visibleItems]);
    const hasMoreHistory = history.length > visibleItems;
    const canCollapseHistory = history.length > INITIAL_VISIBLE_ITEMS && visibleItems > INITIAL_VISIBLE_ITEMS;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Quiz History</h1>

            {stats && (
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Attempts</p>
                        <p className="mt-2 text-3xl font-bold text-violet-700">{stats.attempts}</p>
                    </article>
                    <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Best Score</p>
                        <p className="mt-2 text-3xl font-bold text-violet-700">{Math.round(stats.bestPercentage)}%</p>
                    </article>
                    <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Average Score</p>
                        <p className="mt-2 text-3xl font-bold text-violet-700">{Math.round(stats.averagePercentage)}%</p>
                    </article>
                    <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Improvement</p>
                        <p className={`mt-2 text-3xl font-bold ${stats.improvement >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {stats.improvement >= 0 ? "+" : ""}{Math.round(stats.improvement)}%
                        </p>
                    </article>
                </section>
            )}

            {history.length === 0 && <p className="text-gray-500">No attempts yet.</p>}

            {timeline.length > 0 && (
                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Performance Over Time</h2>
                    <div className="space-y-3">
                        {timeline.map((item) => {
                            const percent = item.totalMarks > 0 ? (item.score / item.totalMarks) * 100 : 0;
                            return (
                                <div key={item.attemptId} className="rounded-xl bg-gray-50 p-3">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="font-medium text-gray-900">{item.quizTitle}</span>
                                        <span className="text-gray-600">{Math.round(percent)}% on {item.attemptDate}</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-gray-200">
                                        <div
                                            className="h-2 rounded-full bg-violet-600"
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {visibleHistory.map((item) => (
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

            {(hasMoreHistory || canCollapseHistory) && (
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => {
                            if (hasMoreHistory) {
                                setVisibleItems((prev) => prev + INITIAL_VISIBLE_ITEMS);
                            } else {
                                setVisibleItems(INITIAL_VISIBLE_ITEMS);
                            }
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-medium bg-violet-100 text-violet-800 hover:bg-violet-200"
                    >
                        {hasMoreHistory ? "View More" : "View Less"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default QuizHistoryPage;
