import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchModuleQuizzes, fetchModules } from "../api/quizApi";

function ModuleQuizListPage() {
    const { moduleId } = useParams();
    const [quizzes, setQuizzes] = useState([]);
    const [modules, setModules] = useState([]);
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
        <div className="space-y-4">
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
        </div>
    );
}

export default ModuleQuizListPage;
