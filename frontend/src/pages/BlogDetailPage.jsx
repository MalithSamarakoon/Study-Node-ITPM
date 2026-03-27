import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Tag from '../components/Tag';

const BlogDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // This grabs the ID from the URL

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Navigation Back */}
            <button
                onClick={() => navigate('/blogs')}
                className="mb-8 text-gray-500 hover:text-purple-600 flex items-center gap-2 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Feed
            </button>

            {/* Blog Content */}
            <article>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
                        W
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Writer Name</p>
                        <p className="text-sm text-gray-500">Posted on March 27, 2026 • 5 min read</p>
                    </div>
                </div>

                <h1 className="text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                    How to Master React 19 for University Projects
                </h1>

                <div className="w-full h-96 bg-gray-200 rounded-3xl mb-10 overflow-hidden">
                    {/* Placeholder for cover image */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
                        Cover Image Placeholder
                    </div>
                </div>

                <div className="prose prose-purple max-w-none text-gray-800 text-lg leading-relaxed mb-12">
                    <p className="mb-6">
                        Developing university projects like <strong>Studey Node</strong> requires a mix of good UI design and solid backend architecture. In this post, we explore how to handle modern React dependencies...
                    </p>
                    <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm mb-6">
                        <code>npm install react-quill-new</code>
                    </div>
                    <p>
                        By using the latest community forks, we can ensure our academic projects stay ahead of the curve while maintaining a smooth user experience.
                    </p>
                </div>

                {/* Tags Section */}
                <div className="border-t border-gray-100 pt-8 flex gap-3">
                    <Tag name="react" />
                    <Tag name="web-dev" />
                    <Tag name="SLIIT" />
                </div>
            </article>
        </div>
    );
};

export default BlogDetailPage;