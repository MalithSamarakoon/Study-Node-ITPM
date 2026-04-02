import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero.jsx";
import FeatureSlider from "./components/FeatureSlider.jsx";
import Feedback from "./components/Feedback.jsx";
import Footer from "./components/Footer.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ModulesPage from "./pages/ModulesPage.jsx";
import UploadResourcePage from "./pages/UploadResourcePage.jsx";
import MyUploadsPage from "./pages/MyUploadsPage.jsx";
import AdminModulesPage from "./pages/AdminModulesPage.jsx";
import AdminResourceApprovalPage from "./pages/AdminResourceApprovalPage.jsx";
import { PrivateRoute, AdminRoute, StudentRoute } from "./components/ProtectedRoute.jsx";
import { ToastContainer } from 'react-toastify';

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
