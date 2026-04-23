import { useEffect, useMemo, useState } from "react";
import { fetchModuleLeaderboard, fetchModules } from "../api/quizApi";

function QuizLeaderboardPage() {
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState("");
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadModules = async () => {
            try {
                const moduleData = await fetchModules();
                setModules(moduleData);
                if (moduleData.length > 0) {
                    setSelectedModuleId(String(moduleData[0].id));
                }
            } finally {
                setLoading(false);
            }
        };

        loadModules();
    }, []);

    useEffect(() => {
        const loadLeaderboard = async () => {
            if (!selectedModuleId) {
                setLeaderboard([]);
                return;
            }

            const data = await fetchModuleLeaderboard(selectedModuleId);
            setLeaderboard(data);
        };

        loadLeaderboard();
    }, [selectedModuleId]);

    const selectedModuleTitle = useMemo(() => {
        const module = modules.find((item) => String(item.id) === String(selectedModuleId));
        return module?.title || "Leaderboard";
    }, [modules, selectedModuleId]);

    if (loading) {
        return <p className="text-gray-600">Loading leaderboard...</p>;
    }

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Compare performance by module and see top-ranked students.
                </p>
            </header>

            <section className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm space-y-4">
                <label className="text-sm text-gray-700">
                    Select Module
                    <select
                        value={selectedModuleId}
                        onChange={(event) => setSelectedModuleId(event.target.value)}
                        className="mt-1 w-full md:w-96 border border-violet-200 rounded-lg px-3 py-2"
                    >
                        {modules.length === 0 && <option value="">No modules available</option>}
                        {modules.map((module) => (
                            <option key={module.id} value={module.id}>
                                {module.title}
                            </option>
                        ))}
                    </select>
                </label>

                <p className="text-sm text-gray-600">
                    Showing ranking for <span className="font-semibold text-gray-900">{selectedModuleTitle}</span>
                </p>
            </section>

            <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-amber-900">Module Leaderboard</h2>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
                        Top 10
                    </span>
                </div>

                {leaderboard.length === 0 ? (
                    <p className="text-sm text-amber-800">No attempts recorded for this module yet.</p>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.slice(0, 10).map((entry) => (
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

export default QuizLeaderboardPage;
