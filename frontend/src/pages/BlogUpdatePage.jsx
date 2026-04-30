import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-toastify'; // Import toast
import TagInput from '../components/TagInput';
import { fetchBlogById, updateBlog } from '../services/blogService';

const BlogUpdatePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState([]);
    const [imageUrl, setImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        fetchBlogById(id)
            .then(res => {
                setTitle(res.data.topic);
                setContent(res.data.content);
                setImageUrl(res.data.imageUrl);
                const existingTags = res.data.tags?.map(t => t.name) || [];
                setTags(existingTags);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Fetch error", err);
                toast.error("Failed to load blog details.");
            });
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        const tagObjects = tags.map(name => ({ name }));
        const updatedData = {
            topic: title,
            content: content,
            imageUrl: imageUrl,
            tags: tagObjects
        };

        try {
            await updateBlog(id, updatedData);

            // Show success toast
            toast.success("Blog updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Navigate back to the detail page after a short delay
            setTimeout(() => {
                navigate(`/blogs/${id}`);
            }, 1500);

        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update the blog. Please try again.");
        }
    };

    if (isLoading) return <div className="text-center py-20 font-medium text-gray-500">Loading Editor...</div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Edit Post</h2>

            {/* Title Input */}
            <input
                className="w-full text-4xl font-bold mb-6 outline-none border-b-2 border-gray-100 focus:border-purple-300 pb-2 transition-colors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Blog Topic"
            />

            {/* Image URL Input */}
            <input
                className="w-full p-3 mb-8 border-2 border-gray-100 rounded-xl outline-none focus:border-purple-300"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Feature Image URL"
            />

            {/* Rich Text Editor */}
            <div className="mb-16">
                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    className="h-80 rounded-xl"
                />
            </div>

            {/* Tag Management */}
            <div className="mt-12">
                <TagInput tags={tags} setTags={setTags} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-12 pt-8 border-t border-gray-100">
                <button
                    onClick={handleUpdate}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all transform hover:scale-105"
                >
                    Save Changes
                </button>
                <button
                    onClick={() => navigate(`/blogs/${id}`)}
                    className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default BlogUpdatePage;