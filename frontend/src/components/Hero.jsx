import React from 'react';
// Import Swiper React components and styles
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import image1 from '../assets/hero/students-studying-image.jpg';
import image2 from '../assets/hero/online-meeting.jpg';
import image3 from '../assets/hero/blog-writing.jpg';
import image4 from '../assets/hero/students-discussing.webp';
import image5 from '../assets/hero/student-quiz.jpg';
import image6 from '../assets/hero/students-group.jpg';

const Hero = () => {
    // Data for your 5 slides
    const slides = [
        {
            id: 1,
            image: image1,
            title: "Single place to end your all struggles",
            description: "Go ahead and say just a little more about what you do."
        },
        {
            id: 2,
            image: image2,
            title: "Master Your Modules",
            description: "Access curated Kuppi videos and documents from top students."
        },
        {
            id: 3,
            image: image3,
            title: "Share Your Knowledge",
            description: "Publish blogs and help the community grow stronger."
        },
        {
            id: 4,
            image: image4,
            title: "Get support from your peers",
            description: "Clarify your doubts from your colleagues."
        },
        {
            id: 5,
            image: image5,
            title: "Test Your Knowledge",
            description: "Polish your knowledge with interactive quizzes."
        },
        {
            id: 6,
            image: image6,
            title: "End stress of grouping",
            description: "Find qualified group members effortlessly."
        }
    ];

    return (
        <section className="w-full h-[500px] md:h-[600px] overflow-hidden">
            <Swiper
                spaceBetween={0}
                centeredSlides={true}
                autoplay={{
                    delay: 5000, // Increased delay slightly for better readability
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="h-full"
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative w-full h-full flex flex-col md:flex-row items-center px-8 md:px-20 bg-white">

                            {/* Left Content Section */}
                            <div className="w-full md:w-1/2 z-10 space-y-4">
                                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                                    {slide.title}
                                </h1>
                                <p className="text-lg text-gray-600 max-w-md">
                                    {slide.description}
                                </p>
                            </div>

                            {/* Right Image Section */}
                            <div className="w-full md:w-1/2 h-64 md:h-auto flex justify-center items-center">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="rounded-xl shadow-lg object-cover w-[90%] h-[80%] max-h-[450px]"
                                />
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Hero;