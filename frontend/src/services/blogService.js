import axios from 'axios';

const API_URL = "http://localhost:8080/api/blogs";

const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
};

export const fetchBlogs = () => axios.get(API_URL);
export const fetchBlogById = (id) => axios.get(`${API_URL}/${id}`);

export const createBlog = (blogData) => {
    return axios.post(API_URL, blogData, { headers: getAuthHeader() });
};

export const updateBlog = (id, blogData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };
    return axios.put(`${API_URL}/${id}`, blogData, config);
};

export const deleteBlog = (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };
    return axios.delete(`${API_URL}/${id}`, config);
};

export const fetchMyBlogs = () => {
    return axios.get(`${API_URL}/me`, { headers: getAuthHeader() });
};