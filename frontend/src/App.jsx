import {Routes, Route, BrowserRouter} from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero.jsx";
import FeatureSlider from "./components/FeatureSlider.jsx";
import Feedback from "./components/Feedback.jsx";
import Footer from "./components/Footer.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import BlogPage from "./pages/BlogPage.jsx"; // New Import

const HomePage = () => (
    <>
        <Hero/>
        <FeatureSlider/>
        <Feedback/>
    </>
)

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar/>
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/registration" element={<RegistrationPage/>}/>
                        <Route path="/blogs" element={<BlogPage/>}/> {/* New Route */}
                    </Routes>
                </main>
                <Footer/>
            </div>
        </BrowserRouter>
    );
};

export default App;
