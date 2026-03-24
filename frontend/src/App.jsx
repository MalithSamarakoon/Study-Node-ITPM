import {Routes, Route, BrowserRouter, useLocation} from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero.jsx";
import FeatureSlider from "./components/FeatureSlider.jsx";
import Feedback from "./components/Feedback.jsx";
import Footer from "./components/Footer.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import {ToastContainer} from 'react-toastify';

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
                    <Route path="/blogs" element={<BlogPage/>}/>
                </Routes>
            </main>
            {!hideLayout && <Footer />}
            <ToastContainer/>
        </div>
    );
};

export default App;
