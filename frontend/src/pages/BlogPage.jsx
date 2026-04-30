import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import BlogCard from "../components/BlogCard";
import FloatingActionButton from "../components/FloatingActionButton";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { fetchBlogs, fetchMyBlogs } from "../services/blogService";

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        setIsLoading(true);
        fetchBlogs()
            .then(res => {
                setBlogs(res.data);
                setIsLoading(false); // Stop loading when data arrives
            })
            .catch(err => {
                console.error("Error fetching blogs:", err);
                setIsLoading(false); // Stop loading even on error
            });
    }, []);

    useEffect(() => {
        loadBlogs();
    }, [activeTab]);

    const loadBlogs = () => {
        setIsLoading(true);
        const request = activeTab === 'all' ? fetchBlogs() : fetchMyBlogs();

        request
            .then(res => {
                setBlogs(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Error fetching blogs:", err);
                setIsLoading(false);
            });
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
            <div className="flex gap-10">
                <aside className="w-1/4">
                    <Sidebar />
                </aside>

                <section className="w-3/4">
                    <SearchBar />

                    {/* Tab Navigation */}
                    <div className="flex gap-8 mb-8 border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`pb-4 px-2 font-semibold transition-colors relative ${
                                activeTab === 'all' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            All
                            {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600 rounded-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('mine')}
                            className={`pb-4 px-2 font-semibold transition-colors relative ${
                                activeTab === 'mine' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            My blogs
                            {activeTab === 'mine' && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-600 rounded-full" />}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : blogs.length > 0 ? (
                            blogs.map((blog) => (
                                <BlogCard
                                    key={blog.id}
                                    id={blog.id}
                                    writer={blog.writer.username} // Accessing the user object
                                    topic={blog.topic}
                                    tags={blog.tags.map(t => t.name)}
                                    imageUrl={blog.imageUrl}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 text-xl font-medium">No blogs found here.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <FloatingActionButton />
        </div>
    );
};

export default BlogPage;