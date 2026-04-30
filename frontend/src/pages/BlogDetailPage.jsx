import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBlogById } from '../services/blogService';
import BlogContentCard from '../components/BlogContentCard';

const BlogDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [blog, setBlog] = useState(null);

    useEffect(() => {
        fetchBlogById(id)
            .then(res => {
                console.log("Full Blog Data:", res.data);
                setBlog(res.data);
            })
            .catch(err => console.error(err));
    }, [id]);

    if (!blog) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-200 rounded-full mb-4"></div>
                <p className="text-gray-400 font-medium">Retrieving Article...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-20 px-6">
            <div className="max-w-4xl mx-auto">


                <button
                    onClick={() => navigate('/blogs')}
                    className="group mb-8 inline-flex items-center gap-3 text-gray-400 hover:text-purple-600 font-bold transition-all"
                >
                    <span className="text-2xl group-hover:-translate-x-2 transition-transform">←</span>
                    BACK TO FEED
                </button>


                <BlogContentCard blog={blog} />

            </div>
        </div>
    );
};

export default BlogDetailPage;