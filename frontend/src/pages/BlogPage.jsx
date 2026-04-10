import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import BlogCard from "../components/BlogCard";
import FloatingActionButton from "../components/FloatingActionButton";

const BlogPage = () => {

    const dummyBlogs = [
        { id: 1, writer: "Ravindu Perera", topic: "How to pass a React Interview", tags: ["React", "Interview prep"] },
        { id: 2, writer: "Navindu Thathsara", topic: "Best tech stacks to tryout in 2026", tags: ["tech-stack", "software engineering"] },
        { id: 3, writer: "Dinuli Amaya", topic: "How I get into IFS", tags: ["Interview prep", "communication"] },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
            <div className="flex gap-10">
                {/* Left Side: Sidebar (approx 30%) */}
                <aside className="w-1/4">
                    <Sidebar />
                </aside>

                {/* Right Side: Feed (approx 70%) */}
                <section className="w-3/4">
                    <SearchBar />
                    <div className="space-y-4">
                        {dummyBlogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                id={blog.id}
                                writer={blog.writer}
                                topic={blog.topic}
                                tags={blog.tags}
                            />
                        ))}
                    </div>
                </section>
            </div>

            <FloatingActionButton />
        </div>
    );
};

export default BlogPage;