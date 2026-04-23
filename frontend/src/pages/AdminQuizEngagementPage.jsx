import { useEffect, useMemo, useState } from "react";
import { fetchQuizEngagementStats } from "../api/quizApi";

const formatPercent = (value) => `${Math.round(value ?? 0)}%`;

function AdminQuizEngagementPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchQuizEngagementStats();
                setStats(data);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const trend = stats?.activityTrend ?? [];
    const quizActivity = stats?.quizActivity ?? [];
    const students = stats?.studentEngagement ?? [];

    const trendPath = useMemo(() => {
        if (trend.length === 0) {
            return "";
        }

        const maxAttempts = Math.max(...trend.map((item) => item.attempts), 1);
        return trend
            .map((item, index) => {
                const x = trend.length === 1 ? 50 : (index / (trend.length - 1)) * 100;
                const y = 100 - (item.attempts / maxAttempts) * 100;
                return `${x},${y}`;
            })
            .join(" ");
    }, [trend]);

    const maxQuizAttempts = useMemo(() => {
        if (quizActivity.length === 0) {
            return 1;
        }
        return Math.max(...quizActivity.map((item) => item.attempts), 1);
    }, [quizActivity]);

    if (loading) {
        return <p className="text-gray-600">Loading engagement analytics...</p>;
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Quiz Engagement</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Student interaction, top-performing quizzes, and weekly activity trends.
                </p>
            </header>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Total Attempts</p>
                    <p className="mt-2 text-3xl font-bold text-violet-700">{stats?.totalAttempts ?? 0}</p>
                </article>
                <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Unique Students</p>
                    <p className="mt-2 text-3xl font-bold text-indigo-700">{stats?.uniqueStudents ?? 0}</p>
                </article>
                <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Engaged Quizzes</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">{stats?.quizzesWithAttempts ?? 0}</p>
                </article>
                <article className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Average Score</p>
                    <p className="mt-2 text-3xl font-bold text-amber-600">{formatPercent(stats?.averageScorePercentage)}</p>
                </article>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <article className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Most Engaged Quiz</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">{stats?.mostEngagedQuiz?.quizTitle || "No data yet"}</p>
                    <p className="mt-1 text-sm text-gray-600">Attempts: {stats?.mostEngagedQuiz?.attempts ?? 0}</p>
                    <p className="text-sm text-gray-600">Unique Students: {stats?.mostEngagedQuiz?.uniqueStudents ?? 0}</p>
                </article>
                <article className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Most Liked Quiz</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">{stats?.mostLikedQuiz?.quizTitle || "No data yet"}</p>
                    <p className="mt-1 text-sm text-gray-600">
                        Repeat Attempt Rate: {formatPercent(stats?.mostLikedQuiz?.repeatAttemptRate)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Based on repeat attempts by students.</p>
                </article>
            </section>

            <section className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Weekly Activity Graph</h2>
                {trend.length === 0 ? (
                    <p className="text-sm text-gray-500">No trend data available yet.</p>
                ) : (
                    <>
                        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3">
                            <svg viewBox="0 0 100 100" className="w-full h-44" preserveAspectRatio="none">
                                <polyline
                                    fill="none"
                                    stroke="#7c3aed"
                                    strokeWidth="2.5"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    points={trendPath}
                                />
                            </svg>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                            {trend.map((item) => (
                                <div key={item.date} className="rounded-lg bg-gray-50 border border-gray-200 p-2">
                                    <p className="text-gray-500">{item.date}</p>
                                    <p className="font-semibold text-gray-900">{item.attempts} attempts</p>
                                    <p className="text-gray-600">{item.uniqueStudents} students</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>

            <section className="grid gap-4 xl:grid-cols-5">
                <article className="xl:col-span-3 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Quiz Interaction Graph</h2>
                    {quizActivity.length === 0 ? (
                        <p className="text-sm text-gray-500">No quiz interaction data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {quizActivity.slice(0, 8).map((item) => {
                                const width = (item.attempts / maxQuizAttempts) * 100;
                                return (
                                    <div key={item.quizId} className="space-y-1">
                                        <div className="flex items-center justify-between gap-3 text-sm">
                                            <span className="font-medium text-gray-900 truncate">{item.quizTitle}</span>
                                            <span className="text-gray-600">{item.attempts} attempts</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-gray-200">
                                            <div className="h-2 rounded-full bg-violet-600" style={{ width: `${width}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </article>

                <article className="xl:col-span-2 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm space-y-3">
                    <h2 className="text-lg font-semibold text-gray-900">Students Who Interacted</h2>
                    {students.length === 0 ? (
                        <p className="text-sm text-gray-500">No student interaction data yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {students.slice(0, 10).map((student) => (
                                <div key={student.studentId} className="rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-2">
                                    <p className="font-medium text-gray-900">{student.studentName}</p>
                                    <p className="text-xs text-gray-600">{student.studentId}</p>
                                    <p className="text-xs text-gray-700 mt-1">
                                        Attempts: {student.attempts} | Avg: {formatPercent(student.averageScorePercentage)} | Best: {formatPercent(student.bestScorePercentage)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            </section>
        </div>
    );
}

export default AdminQuizEngagementPage;
