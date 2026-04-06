import React from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import Tag from "./Tag";

const BlogCard = ({ id, writer, topic, imageUrl, tags }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/blogs/${id}`)} // Redirects to the detail page
            className="flex bg-white border-2 border-purple-400 rounded-3xl p-6 mb-6 shadow-sm
                       cursor-pointer transform transition-all duration-300
                       hover:scale-[1.01] hover:shadow-xl hover:border-purple-600 group"
        >
            {/* Left side: Content */}
            <div className="flex-grow flex flex-col justify-between">
                <div>
                    <div className="bg-gray-200 text-gray-700 text-sm px-4 py-1 inline-block rounded mb-4 group-hover:bg-purple-100 transition-colors">
                        {writer}
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 group-hover:text-purple-700 transition-colors">
                        {topic}
                    </h2>
                </div>

                {/* Tags at bottom */}
                <div className="flex gap-2">
                    {tags.map((tag, index) => (
                        <Tag key={index} name={tag} />
                    ))}
                </div>
            </div>

            {/* Right side: Image */}
            <div className="ml-6 flex-shrink-0">
                <div className="w-40 h-40 bg-gray-300 rounded-3xl overflow-hidden flex items-center justify-center text-gray-500 italic border border-transparent group-hover:border-purple-200">
                    {imageUrl ? (
                        <img src={imageUrl} alt={topic} className="w-full h-full object-cover" />
                    ) : (
                        "image"
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogCard;