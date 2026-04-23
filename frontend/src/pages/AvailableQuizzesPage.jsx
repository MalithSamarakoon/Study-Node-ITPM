import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchModules, fetchModuleQuizzes } from "../api/quizApi";

function AvailableQuizzesPage() {
    const [quizRows, setQuizRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const modules = await fetchModules();
                const quizzesByModule = await Promise.all(
                    modules.map(async (module) => {
                        const quizzes = await fetchModuleQuizzes(module.id);
                        return quizzes
                            .filter((quiz) => quiz.status === "ACTIVE")
                            .map((quiz) => ({
                                ...quiz,
                                moduleId: module.id,
                                moduleTitle: module.title
                            }));
                    })
                );
                setQuizRows(quizzesByModule.flat());
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) {
        return <p className="text-gray-600">Loading quizzes...</p>;
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Available Quizzes</h1>
            {quizRows.length === 0 && <p className="text-gray-500">No active quizzes available.</p>}
            {quizRows.map((quiz) => (
                <article key={quiz.id} className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-indigo-900">{quiz.title}</h2>
                    <p className="text-sm text-gray-600">Module: {quiz.moduleTitle}</p>
                    <p className="text-sm text-gray-600 mt-2">Duration: {quiz.duration} Minutes</p>
                    <p className="text-sm text-gray-600">Total Marks: {quiz.totalMarks}</p>
                    <p className="text-sm mt-1 text-emerald-700 font-medium">Status: {quiz.attempted ? "Completed" : "Not Attempted"}</p>
                    <div className="mt-4">
                        {quiz.attempted ? (
                            <Link
                                to={`/quiz/modules/${quiz.moduleId}/results/${quiz.latestAttemptId}`}
                                className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700"
                            >
                                View Result
                            </Link>
                        ) : (
                            <Link
                                to={`/quiz/modules/${quiz.moduleId}/quizzes/${quiz.id}/attempt`}
                                className="inline-block bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700"
                            >
                                Start Quiz
                            </Link>
                        )}
                    </div>
                </article>
            ))}
        </div>
    );
}

export default AvailableQuizzesPage;
