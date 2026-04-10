import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import TagInput from '../components/TagInput';
import { createBlog } from '../services/blogService';

const BlogEditorPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState([]);
    const [imageUrl, setImageUrl] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Transform string tags into objects for the backend
        const tagObjects = tags.map(tagName => ({ name: tagName }));

        const blogData = {
            topic: title,
            content: content,
            writerName: "Current User", // Simple string for viva
            imageUrl: imageUrl,
            tags: tagObjects
        };

        try {
            await createBlog(blogData);
            alert("Blog published successfully!");
            navigate('/blogs');
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center mb-10">
                <button onClick={() => navigate('/blogs')} className="text-gray-500 hover:text-purple-600">Back</button>
                <button onClick={handleSubmit} className="px-6 py-2 bg-purple-600 text-white rounded-lg">Publish Post</button>
            </div>

            <input
                type="text"
                placeholder="Enter your post topic here..."
                className="w-full text-5xl font-bold border-none outline-none mb-8"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <input
                type="text"
                placeholder="Paste Image URL here..."
                className="w-full p-3 border-2 border-gray-100 rounded-xl mb-8 outline-none focus:border-purple-300"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
            />

            <ReactQuill theme="snow" value={content} onChange={setContent} className="h-80 mb-12" />
            <TagInput tags={tags} setTags={setTags} />
        </div>
    );
};

export default BlogEditorPage;