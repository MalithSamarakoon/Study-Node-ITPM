import React from 'react';
import { useNavigate } from "react-router-dom";

const FloatingActionButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/blogs/create')}
            className="fixed bottom-12 right-12 w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-300 transition-colors z-50 border border-gray-400"
        >
            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
        </button>
    );
};

export default FloatingActionButton;