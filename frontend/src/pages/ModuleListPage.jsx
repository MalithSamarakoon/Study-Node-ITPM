import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchModules } from "../api/quizApi";

function ModuleListPage() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadModules = async () => {
            try {
                const data = await fetchModules();
                setModules(data);
            } finally {
                setLoading(false);
            }
        };

        loadModules();
    }, []);

    if (loading) {
        return <p className="text-gray-600">Loading modules...</p>;
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">All Modules</h1>
            {modules.map((module) => (
                <article key={module.id} className="bg-white border border-violet-100 rounded-2xl p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-indigo-900">{module.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">{module.quizCount} Quizzes Available</p>
                    <p className="text-sm text-gray-500 mt-2">{module.description}</p>
                    <Link
                        to={`/quiz/modules/${module.id}/quizzes`}
                        className="inline-block mt-4 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-violet-700"
                    >
                        View Quizzes
                    </Link>
                </article>
            ))}
        </div>
    );
}

export default ModuleListPage;
