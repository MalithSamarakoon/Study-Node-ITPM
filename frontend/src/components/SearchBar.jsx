import React from 'react';

const SearchBar = () => {
    return (
        <div className="relative w-full mb-8">
      <span className="absolute inset-y-0 left-0 flex items-center pl-4">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
            <input
                type="text"
                placeholder="search by keyword"
                className="w-full py-3 pl-12 pr-4 border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-500 transition-colors"
            />
        </div>
    );
};

export default SearchBar;