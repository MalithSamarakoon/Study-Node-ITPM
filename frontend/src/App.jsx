import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero.jsx";
import FeatureSlider from "./components/FeatureSlider.jsx";
import Feedback from "./components/Feedback.jsx";
import Footer from "./components/Footer.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { ToastContainer } from 'react-toastify';
import BlogEditorPage from "./pages/BlogEditorPage.jsx";
import BlogDetailPage from "./pages/BlogDetailPage.jsx";
import ModulesPage from "./pages/ModulesPage.jsx";
import UploadResourcePage from "./pages/UploadResourcePage.jsx";
import MyUploadsPage from "./pages/MyUploadsPage.jsx";
import AdminModulesPage from "./pages/AdminModulesPage.jsx";
import AdminResourceApprovalPage from "./pages/AdminResourceApprovalPage.jsx";
import { AdminRoute, StudentRoute } from "./components/ProtectedRoute.jsx";
import QAPage from "./pages/QAPage.jsx";
import QuestionDetailPage from "./pages/QuestionDetailPage.jsx";
import TeamupLayout from "./teamup/components/TeamupLayout.jsx";
import TeamListPage from "./teamup/pages/TeamListPage.jsx";
import CreateTeamPage from "./teamup/pages/CreateTeamPage.jsx";
import TeamStatusPage from "./teamup/pages/TeamStatusPage.jsx";
import TeamDetailsPage from "./teamup/pages/TeamDetailsPage.jsx";
import TeamEditPage from "./teamup/pages/TeamEditPage.jsx";
import TeamAdminPage from "./teamup/pages/TeamAdminPage.jsx";

const HomePage = () => (
    <>
        <Hero />
        <FeatureSlider />
        <Feedback />
    </>
);

function App() {
    const location = useLocation();

    // Only hide the main Navbar/Footer on auth pages
    const hideLayout = location.pathname === '/registration' || location.pathname === '/login';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {!hideLayout && <Navbar />}
            <main className="flex-grow">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/registration" element={<RegistrationPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/blogs" element={<BlogPage />} />
                    <Route path="/blogs/create" element={<BlogEditorPage />} />
                    <Route path="/blogs/:id" element={<BlogDetailPage />} />
                    <Route path="/teamup" element={<Navigate to="/teams" replace />} />

                    {/* TeamUp routes */}
                    <Route path="/teams" element={<TeamupLayout />}>
                        <Route index element={<TeamListPage />} />
                        <Route path="new" element={<CreateTeamPage />} />
                        <Route path="my" element={<TeamListPage onlyMine />} />
                        <Route path="status" element={<TeamStatusPage />} />
                        <Route path=":id" element={<TeamDetailsPage />} />
                        <Route path=":id/edit" element={<TeamEditPage />} />
                    </Route>
                    <Route path="/admin/teamup" element={<TeamupLayout />}>
                        <Route index element={<TeamAdminPage />} />
                    </Route>

                    {/* Public resource browsing (any visitor) */}
                    <Route path="/resources/modules" element={<ModulesPage />} />

                    {/* Student-only: upload resources */}
                    <Route
                        path="/resources/upload"
                        element={
                            <StudentRoute>
                                <UploadResourcePage />
                            </StudentRoute>
                        }
                    />
                    <Route
                        path="/resources/my-uploads"
                        element={
                            <StudentRoute>
                                <MyUploadsPage />
                            </StudentRoute>
                        }
                    />

                    {/* Q&A Section (Student-only) */}
                    <Route
                        path="/qa"
                        element={
                            <StudentRoute>
                                <QAPage />
                            </StudentRoute>
                        }
                    />
                    <Route
                        path="/qa/question/:id"
                        element={
                            <StudentRoute>
                                <QuestionDetailPage />
                            </StudentRoute>
                        }
                    />

                    {/* Admin-only routes */}
                    <Route
                        path="/admin/modules"
                        element={
                            <AdminRoute>
                                <AdminModulesPage />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/resources"
                        element={
                            <AdminRoute>
                                <AdminResourceApprovalPage />
                            </AdminRoute>
                        }
                    />
                </Routes>
            </main>
            {!hideLayout && <Footer />}
            <ToastContainer />
        </div>
    );
}

export default App;
