import React from 'react';

const Feedback = () => {
    const reviews = [
        { id: 1, text: "Really useful system. I loved it.", name: "Hiran", year: "3 d year undergraduate" },
        { id: 2, text: "The best place to find Kuppi videos!", name: "Anura", year: "2 nd year undergraduate" },
        { id: 3, text: "TeamUp helped me find a great group.", name: "Sajith", year: "3 d year undergraduate" },
        { id: 4, text: "Excellent resource sharing platform.", name: "Dilini", year: "4 th year undergraduate" },
        // Repeat some to ensure a continuous loop
    ];

    return (
        <section className="py-16 bg-white overflow-hidden">
            <h2 className="text-3xl font-bold px-8 md:px-20 mb-10 text-gray-800">
                Students feedback on us
            </h2>

            {/* The scrolling container */}
            <div className="flex relative w-full">
                {/* We duplicate the list to create a seamless loop */}
                <div className="flex animate-marquee whitespace-nowrap gap-8 px-4">
                    {[...reviews, ...reviews].map((review, index) => (
                        <div
                            key={index}
                            className="min-w-[300px] md:min-w-[400px] p-8 border-2 border-purple-300 rounded-3xl bg-white shadow-sm flex flex-col justify-between h-56"
                        >
                            <p className="text-lg italic text-gray-700 font-medium">
                                "{review.text}"
                            </p>
                            <div>
                                <p className="font-bold text-gray-900 mt-4">{review.name},</p>
                                <p className="text-sm text-gray-500">{review.year}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Feedback;