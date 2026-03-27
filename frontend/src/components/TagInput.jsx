import React, { useState } from 'react';

const TagInput = ({ tags, setTags }) => {
    const [input, setInput] = useState("");

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
                setTags([...tags, input.trim()]);
            }
            setInput("");
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (Press Enter to add)</label>
            <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 rounded-xl focus-within:border-purple-400 transition-colors bg-white">
                {tags.map((tag, index) => (
                    <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
            #{tag}
                        <button onClick={() => removeTag(index)} className="hover:text-purple-900 font-bold">&times;</button>
          </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. react, java"
                    className="flex-grow outline-none text-sm"
                />
            </div>
        </div>
    );
};

export default TagInput;