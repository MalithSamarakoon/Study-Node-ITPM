import Navbar from "./components/Navbar";
import Hero from "./components/Hero.jsx";
import FeatureSlider from "./components/FeatureSlider.jsx";
import Feedback from "./components/Feedback.jsx";
import Footer from "./components/Footer.jsx";

function App() {
    return (
       <div className="min-h-screen bg-white">
            <Navbar/>
            <Hero/>
           <FeatureSlider/>
           <Feedback/>
           <Footer/>
       </div>
  );

};

export default App
