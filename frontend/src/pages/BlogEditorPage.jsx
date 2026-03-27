import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import TagInput from '../components/TagInput';

const BlogEditorPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Blog submitted for approval! (Mock Logic)");
        navigate('/blogs');
    };

    // Quill Toolbar configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-10">
                <button
                    onClick={() => navigate('/blogs')}
                    className="text-gray-500 hover:text-purple-600 flex items-center gap-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Feed
                </button>
                <div className="flex gap-4">
                    <button className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                        Save Draft
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-shadow shadow-md"
                    >
                        Submit for Approval
                    </button>
                </div>
            </div>

            {/* Title Input */}
            <input
                type="text"
                placeholder="Enter your post topic here..."
                className="w-full text-5xl font-bold border-none focus:ring-0 placeholder-gray-300 mb-8 outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            {/* Cover Image Placeholder */}
            <div className="w-full h-64 bg-gray-100 rounded-3xl mb-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Click to add a cover image</span>
            </div>

            {/* The Editor */}
            <div className="bg-white rounded-xl overflow-hidden min-h-[400px]">
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    placeholder="Write your story here..."
                    className="h-80 mb-12"
                />
            </div>

            {/* Tag Section */}
            <TagInput tags={tags} setTags={setTags} />
        </div>
    );
};

export default BlogEditorPage;