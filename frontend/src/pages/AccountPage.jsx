import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../utils/auth';
import axios from 'axios';
import profileImage from '../assets/img.png';

const AccountPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = getUser();
            if (currentUser) {
                try {
                    const response = await axios.get('http://localhost:8080/api/users/me', {
                        headers: {
                            Authorization: `Bearer ${currentUser.token}`
                        }
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>User not found.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="bg-white shadow-md rounded-lg p-8">
                <div className="flex items-center space-x-8">
                    <img
                        src={user.profilePicturePath ? `http://localhost:8080${user.profilePicturePath}` : profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover"
                    />
                    <div>
                        <h1 className="text-3xl font-bold">{user.username}</h1>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Profile Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-semibold">Student ID</label>
                            <p>{user.studentId}</p>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold">Phone Number</label>
                            <p>{user.phoneNumber}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8">
                    <Link to="/account/edit">
                        <button className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors">
                            Edit Profile
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;

