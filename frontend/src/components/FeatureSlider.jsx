import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

const FeatureSlider = () => {
    const features = [
        { title: "Share resources you have with peers", link: "/resources" },
        { title: "Share your knowledge by blogs", link: "/blogs" },
        { title: "Find qualified team members", link: "/teamup" },
        { title: "Clarify doubts in Q&A", link: "/quiz/modules" }
    ];

    return (
        <section className="py-16 px-8 md:px-20 bg-white">
            <Swiper
                modules={[Navigation]}
                navigation={true}
                spaceBetween={30}
                slidesPerView={1}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                className="feature-swiper !px-12" // Added padding so arrows don't overlap cards
            >
                {features.map((item, index) => (
                    <SwiperSlide key={index}>
                        {/* Height set to h-[350px] and added py-10 for a fuller look */}
                        <div className="flex flex-col items-center justify-between p-8 py-12 h-[380px] border-2 border-purple-400 rounded-3xl shadow-sm hover:shadow-md transition-shadow bg-white text-center">

                            {/* Increased title size to text-3xl and added tracking-tight */}
                            <h3 className="text-3xl font-extrabold text-purple-700 leading-tight px-2 mt-4">
                                {item.title}
                            </h3>

                            <button
                                onClick={() => window.location.href = item.link}
                                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-lg shadow-purple-200 active:scale-95"
                            >
                                Get Started
                            </button>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default FeatureSlider;