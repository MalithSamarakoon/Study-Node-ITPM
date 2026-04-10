import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import BlogCard from "../components/BlogCard";
import FloatingActionButton from "../components/FloatingActionButton";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { fetchBlogs } from "../services/blogService";

const BlogPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
            <div className="flex gap-10">
                <aside className="w-1/4">
                    <Sidebar />
                </aside>
                <section className="w-3/4">
                    <SearchBar />

                    <div className="space-y-4">
                        {/* Logic: Show Spinner -> Then Empty State -> Then Data */}
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : blogs.length > 0 ? (
                            blogs.map((blog) => (
                                <BlogCard
                                    key={blog.id}
                                    id={blog.id}
                                    writer={blog.writerName}
                                    topic={blog.topic}
                                    tags={blog.tags.map(t => t.name)}
                                    imageUrl={blog.imageUrl}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500 text-xl font-medium">No blogs found.</p>
                                <p className="text-gray-400">Click the pencil icon to start writing!</p>
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