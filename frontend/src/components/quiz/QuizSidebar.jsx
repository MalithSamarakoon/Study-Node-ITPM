import { NavLink } from "react-router-dom";
import { isAdmin } from "../../utils/auth";

const studentItems = [
    { label: "All Modules", path: "/quiz/modules" },
    { label: "Available Quizzes", path: "/quiz/available" },
    { label: "Quiz History", path: "/quiz/history" }
];

const adminItems = [
    { label: "Quiz Dashboard", path: "/quiz/admin" },
    { label: "Manage Modules", path: "/quiz/admin/modules" },
    { label: "Manage Quizzes", path: "/quiz/admin/quizzes" }
];

function QuizSidebar() {
    const items = isAdmin() ? adminItems : studentItems;

    return (
        <aside className="w-full lg:w-64 bg-white border border-violet-100 rounded-2xl p-4 h-fit shadow-sm">
            <h2 className="text-lg font-bold text-violet-700 mb-4">
                {isAdmin() ? "Admin Quiz Panel" : "Quiz Navigation"}
            </h2>
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
