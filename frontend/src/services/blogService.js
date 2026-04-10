import axios from 'axios';

const API_URL = "http://localhost:8080/api/blogs";

export const fetchBlogs = () => axios.get(API_URL);
export const fetchBlogById = (id) => axios.get(`${API_URL}/${id}`);
export const createBlog = (blogData) => axios.post(API_URL, blogData);