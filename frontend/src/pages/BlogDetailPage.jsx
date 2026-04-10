import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Tag from '../components/Tag';
import { fetchBlogById } from '../services/blogService';

const BlogDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        fetchBlogById(id)
            .then(res => setBlog(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!blog) return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading your story...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Navigation Back */}
            <button
                onClick={() => navigate('/blogs')}
                className="group mb-10 text-gray-500 hover:text-purple-600 flex items-center gap-2 transition-all"
            >
                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Feed
            </button>

            <article>
                {/* Header: Title and Author Info */}
                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
                        {blog.topic}
                    </h1>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                            {blog.writerName ? blog.writerName.charAt(0) : 'S'}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-lg">{blog.writerName}</p>
                            <p className="text-sm text-gray-500">Published in Study Node • 2026</p>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {blog.imageUrl && (
                    <div className="mb-12 rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                        <img
                            src={blog.imageUrl}
                            alt={blog.topic}
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                    </div>
                )}

                {/* Main Content Area: Styled for Readability */}
                <div
                    className="text-gray-800 text-lg leading-relaxed mb-16
                               [&>p]:mb-6 [&>p]:leading-8
                               [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:text-gray-900
                               [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-4 [&>h3]:text-gray-800
                               [&>ul]:list-disc [&>ul]:ml-8 [&>ul]:mb-8 [&>ul]:space-y-2
                               [&>ol]:list-decimal [&>ol]:ml-8 [&>ol]:mb-8 [&>ol]:space-y-2
                               [&>li]:pl-2
                               [&>strong]:text-gray-900 [&>strong]:font-bold
                               [&>blockquote]:border-l-4 [&>blockquote]:border-purple-500 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:my-8 [&>blockquote]:text-gray-600
                               [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:p-6 [&>pre]:rounded-2xl [&>pre]:my-8 [&>pre]:overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Footer: Tags and Dividers */}
                <footer className="border-t border-gray-100 pt-10">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Related Tags</p>
                    <div className="flex flex-wrap gap-3">
                        {blog.tags && blog.tags.map(tag => (
                            <Tag key={tag.id} name={tag.name} />
                        ))}
                    </div>
                </footer>
            </article>
        </div>
    );
};

export default BlogDetailPage;