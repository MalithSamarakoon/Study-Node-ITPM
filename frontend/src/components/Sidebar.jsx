import React from 'react';
import Tag from "./Tag";

const Sidebar = () => {
    const popularTags = ["java", "React", "interview preparation"];

    return (
        <div className="border-2 border-purple-400 rounded-3xl p-8 min-h-[600px] bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Popular categories</h2>
            <div className="flex flex-wrap gap-3">
                {popularTags.map((tag, index) => (
                    <Tag key={index} name={tag} />
                ))}
            </div>
        </div>
    );
};

export default Sidebar;