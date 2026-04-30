import React from 'react';
import { useNavigate } from 'react-router-dom';
import Tag from './Tag';
import {deleteBlog} from "../services/blogService.js";
import { toast } from 'react-toastify';

const BlogContentCard = ({ blog }) => {
    const navigate = useNavigate();

    // 1. Authorization Logic: Get the logged-in user from localStorage
    const userString = localStorage.getItem('user');
    const currentUser = userString ? JSON.parse(userString) : null;

    // 2. Check if the logged-in user is the author of this post
    // We compare IDs because names can be identical, but IDs are unique in your DB
    const isAuthor = currentUser && blog.writer && currentUser.id === blog.writer.id;

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this article? This action cannot be undone.");

        if (confirmed) {
            try {
                await deleteBlog(blog.id);
                toast.success("Article deleted successfully!");
                navigate('/blogs'); // Redirect to the blog feed
            } catch (error) {
                console.error("Delete failed", error);
                toast.error("Failed to delete the article.");
            }
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-12 animate-fadeIn">

            {/* Featured Image */}
            {blog.imageUrl && (
                <div className="relative h-[300px] md:h-[450px] w-full overflow-hidden">
                    <img
                        src={blog.imageUrl}
                        alt={blog.topic}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
            )}

            <div className="p-8 md:p-14">

                {/* Header Section: Author Info & Edit Button */}
                <div className="flex justify-between items-center mb-10 pb-8 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg transform -rotate-3">
                            {blog.writer?.username?.charAt(0) || 'S'}
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 leading-tight">
                                {blog.writer?.username || 'Study Node Author'}
                            </p>
                            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                                Technical Article • 2026
                            </p>
                        </div>
                    </div>

                    {/* ONLY show Edit button if current user is the author */}
                    {isAuthor && (
                        <>
                            <button
                                onClick={() => navigate(`/blogs/edit/${blog.id}`)}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg
                                           transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit Article
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-bold shadow-md transition-all transform hover:scale-105"
                            >
                                Delete Article
                            </button>
                        </>

                    )}
                </div>

                {/* Article Title */}
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-10 leading-[1.1] tracking-tight">
                    {blog.topic}
                </h1>

                {/* Main Content Area with Scoped Professional CSS */}
                <div className="article-body-container">
                    <div
                        className="text-gray-700 text-lg md:text-xl leading-9 text-left selection:bg-purple-100 selection:text-purple-900"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    <style>{`
                        .article-body-container p {
                            margin-bottom: 2rem;
                            letter-spacing: -0.011em;
                        }
                        .article-body-container h2 {
                            font-size: 2.25rem;
                            font-weight: 800;
                            margin-top: 3.5rem;
                            margin-bottom: 1.5rem;
                            color: #111827;
                            line-height: 1.2;
                        }
                        .article-body-container h3 {
                            font-size: 1.75rem;
                            font-weight: 700;
                            margin-top: 2.5rem;
                            margin-bottom: 1rem;
                            color: #1f2937;
                        }
                        .article-body-container ul, .article-body-container ol {
                            margin-left: 1.5rem;
                            margin-bottom: 2rem;
                            padding-left: 1rem;
                        }
                        .article-body-container li {
                            margin-bottom: 0.75rem;
                        }
                        .article-body-container strong {
                            color: #111827;
                            font-weight: 700;
                        }
                        .article-body-container img {
                            border-radius: 1.5rem;
                            margin: 3rem 0;
                            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
                        }
                    `}</style>
                </div>

                {/* Footer Section: Tags */}
                <div className="mt-16 pt-10 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Categorized in</p>
                    <div className="flex flex-wrap gap-3">
                        {blog.tags && blog.tags.length > 0 ? (
                            blog.tags.map(tag => (
                                <Tag key={tag.id} name={tag.name} />
                            ))
                        ) : (
                            <span className="text-gray-300 italic text-sm">No tags added</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogContentCard;