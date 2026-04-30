import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, deleteAccount } from '../utils/auth';
import axios from 'axios';
import profileImage from '../assets/img.png';
import {toast} from "react-toastify";

const AccountPage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {

        const confirmed = window.confirm(
            "Are you absolutely sure? This will permanently delete your Study Node account and all your published blogs."
        );

        if (confirmed) {
            try {

                await deleteAccount();
                toast.success("Your account has been deleted.");
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("authChange")); // Notify Navbar to update
                navigate("/login");
            } catch (error) {
                console.error("Deletion failed", error);
                toast.error("Could not delete account. Please try again.");
            }
        }
    };

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
            <div className="bg-white shadow-xl rounded-3xl p-8 md:p-12 border border-gray-100">
                {/* 1. Header Section */}
                <div className="flex items-center space-x-8 mb-10 pb-10 border-b border-gray-50">
                    <img
                        src={user.profilePicturePath ? `http://localhost:8080${user.profilePicturePath}` : profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-3xl object-cover shadow-lg transform rotate-3"
                    />
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">{user.username}</h1>
                        <p className="text-lg text-purple-600 font-medium">{user.email}</p>
                    </div>
                </div>


                <div className="mb-12">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Profile Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <label className="block text-gray-500 text-sm font-bold mb-1">Student ID</label>
                            <p className="text-gray-900 font-semibold">{user.studentId || "Not Provided"}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <label className="block text-gray-500 text-sm font-bold mb-1">Phone Number</label>
                            <p className="text-gray-900 font-semibold">{user.phoneNumber || "Not Provided"}</p>
                        </div>
                    </div>
                </div>


                <div className="flex items-center gap-4 mb-16">
                    <Link to="/account/edit">
                        <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105">
                            Edit Profile
                        </button>
                    </Link>
                </div>


                <div className="pt-10 border-t-2 border-red-50">
                    <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h3 className="text-red-800 font-black text-xl mb-2">Danger Zone</h3>
                                <p className="text-red-600 text-sm font-medium">
                                    Once you delete your account, there is no going back. All your data, including blogs and resources, will be permanently removed from Study Node.
                                </p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="bg-white border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 rounded-xl font-black shadow-sm transition-all transform hover:scale-105 whitespace-nowrap"
                            >
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;

