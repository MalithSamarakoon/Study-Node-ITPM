import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getUser } from '../utils/auth';
import { useFormValidation } from '../hooks/useFormValidation';
import profileImage from '../assets/img.png';
//import * as response from "autoprefixer";

const ProfileEdit = () => {
    const navigate = useNavigate();
    const currentUser = getUser();
    const { formData, setFormData, errors, handleChange, handleBlur } = useFormValidation({
        username: '',
        studentId: '',
        email: '',
        phone: '',
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState(profileImage);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (currentUser) {
                try {
                    const response = await axios.get('http://localhost:8080/api/users/me', {
                        headers: {
                            Authorization: `Bearer ${currentUser.token}`
                        }
                    });
                    const { username, studentId, email, phoneNumber, profilePicturePath } = response.data;
                    setFormData({ username, studentId, email, phone: phoneNumber });
                    if (profilePicturePath) {
                        setPreview(`http://localhost:8080${profilePicturePath}`);
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                }
            }
        };

        fetchUser();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatedData = new FormData();
        updatedData.append('user', new Blob([JSON.stringify({
            username: formData.username,
            studentId: formData.studentId,
            email: formData.email,
            phone: formData.phone,
        })], { type: 'application/json' }));

        if (profilePicture) {
            updatedData.append('profileImage', profilePicture);
        }

        try {
            const response= await axios.put('http://localhost:8080/api/users/me', updatedData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });

            const userInStorage = JSON.parse(localStorage.getItem("user"));

            const updatedUser = {
                ...userInStorage,
                username: response.data.username,
                token: response.data.token
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));
            toast.success('Profile updated successfully!');
            window.dispatchEvent(new Event("authChange"));
            navigate('/account');
        } catch (error) {
            toast.error('Failed to update profile. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="bg-white shadow-md rounded-lg p-8">
                <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center space-x-8 mb-8">
                        <img
                            src={preview}
                            alt="Profile Preview"
                            className="w-32 h-32 rounded-full object-cover"
                        />
                        <div>
                            <label htmlFor="profilePicture" className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
                                Change Picture
                            </label>
                            <input
                                type="file"
                                id="profilePicture"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-semibold">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 transition-all ${errors.username ? 'border-red-500' : 'border-gray-400'}`}
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500' : 'border-gray-400'}`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold">Student ID</label>
                            <input
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 transition-all ${errors.studentId ? 'border-red-500' : 'border-gray-400'}`}
                            />
                            {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500' : 'border-gray-400'}`}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEdit;

