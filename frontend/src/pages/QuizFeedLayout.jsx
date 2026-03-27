import { Outlet } from "react-router-dom";
import QuizSidebar from "../components/quiz/QuizSidebar";

function QuizFeedLayout() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                <QuizSidebar />
                <section className="bg-gradient-to-br from-violet-50 to-white border border-violet-100 rounded-2xl p-6 min-h-[70vh]">
                    <Outlet />
                </section>
            </div>
        </div>
    );
}

export default QuizFeedLayout;
