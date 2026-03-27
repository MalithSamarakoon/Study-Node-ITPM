import {Routes, Route, Navigate, useLocation} from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero.jsx";
import FeatureSlider from "./components/FeatureSlider.jsx";
import Feedback from "./components/Feedback.jsx";
import Footer from "./components/Footer.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import QuizFeedLayout from "./pages/QuizFeedLayout.jsx";
import ModuleListPage from "./pages/ModuleListPage.jsx";
import AvailableQuizzesPage from "./pages/AvailableQuizzesPage.jsx";
import ModuleQuizListPage from "./pages/ModuleQuizListPage.jsx";
import QuizAttemptPage from "./pages/QuizAttemptPage.jsx";
import QuizResultPage from "./pages/QuizResultPage.jsx";
import QuizHistoryPage from "./pages/QuizHistoryPage.jsx";

const HomePage = () => (
    <>
        <Hero/>
        <FeatureSlider/>
        <Feedback/>
    </>
)

function App() {
    const location = useLocation();

    const hideLayout = location.pathname === '/registration' || location.pathname === '/login';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {!hideLayout && <Navbar />}
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/registration" element={<RegistrationPage/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/blogs" element={<BlogPage/>}/>
                    <Route path="/quiz" element={<QuizFeedLayout/>}>
                        <Route index element={<Navigate to="modules" replace/>}/>
                        <Route path="modules" element={<ModuleListPage/>}/>
                        <Route path="available" element={<AvailableQuizzesPage/>}/>
                        <Route path="attempts" element={<QuizHistoryPage/>}/>
                        <Route path="results" element={<QuizHistoryPage/>}/>
                        <Route path="history" element={<QuizHistoryPage/>}/>
                        <Route path="modules/:moduleId/quizzes" element={<ModuleQuizListPage/>}/>
                        <Route path="modules/:moduleId/quizzes/:quizId/attempt" element={<QuizAttemptPage/>}/>
                        <Route path="modules/:moduleId/results/:attemptId" element={<QuizResultPage/>}/>
                    </Route>
                </Routes>
            </main>
            {!hideLayout && <Footer />}
        </div>
    );
};

export default App;
