import { NavLink } from "react-router-dom";

const items = [
    { label: "All Modules", path: "/quiz/modules" },
    { label: "Available Quizzes", path: "/quiz/available" },
    { label: "My Attempts", path: "/quiz/attempts" },
    { label: "My Results", path: "/quiz/results" },
    { label: "Quiz History", path: "/quiz/history" }
];

function QuizSidebar() {
    return (
        <aside className="w-full lg:w-64 bg-white border border-violet-100 rounded-2xl p-4 h-fit shadow-sm">
            <h2 className="text-lg font-bold text-violet-700 mb-4">Quiz Navigation</h2>
            <nav className="space-y-2">
                {items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `block rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-violet-100 text-violet-700"
                                    : "text-gray-700 hover:bg-violet-50"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default QuizSidebar;
