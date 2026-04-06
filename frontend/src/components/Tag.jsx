import React from 'react';

const Tag = ({ name }) => {
    return (
        <button className="px-4 py-1 border-2 border-gray-400 rounded-full text-sm font-medium hover:border-purple-500 hover:text-purple-600 transition-colors bg-white">
            #{name}
        </button>
    );
};

export default Tag;