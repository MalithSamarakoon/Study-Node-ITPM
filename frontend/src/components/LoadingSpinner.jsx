import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            {/* The actual spinning circle */}
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-purple-600 font-medium animate-pulse">
                Fetching the latest stories...
            </p>
        </div>
    );
};

export default LoadingSpinner;