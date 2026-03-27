import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import profileImage from '../assets/img.png';

const Navbar = () => {
    // Check for the presence of the user object instead of a boolean flag
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const checkAuth = () => {
        // Update the state based on the actual JWT user object
        const storedUser = localStorage.getItem('user');
        setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    useEffect(() => {
        // Listen for the event dispatched by Login/RegistrationForm
        window.addEventListener("authChange", checkAuth);

        return () => {
            window.removeEventListener("authChange", checkAuth);
        };
    }, []);

    const handleSignOut = () => {
        // Clear all auth-related data from storage
        localStorage.removeItem('user');

        // Notify the rest of the app that the user has logged out
        window.dispatchEvent(new Event("authChange"));

        setShowDropdown(false);
        navigate('/login'); // Redirect back to login page
    };

    return (
        <header className="w-full">
            <div className="flex justify-between items-center px-8 py-4 bg-white">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rotate-45"></div>
                    <span className="text-xl font-bold text-gray-800">Study Node</span>
                </Link>

                <div className="relative">
                    {/* If user exists in state, show the profile icon */}
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-600">
                                Hi, {user.username}
                            </span>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="focus:outline-none"
                            >
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full border border-gray-200 hover:border-purple-400 transition-all"
                                />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login">
                                <button className="text-gray-600 font-medium hover:text-purple-600">Log in</button>
                            </Link>
                            <Link to="/registration">
                                <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                                    Sign up
                                </button>
                            </Link>
                        </div>
                    )}

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                            <ul className="py-2">
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowDropdown(false)}
                                        className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        My Profile
                                    </Link>
                                </li>
                                <li
                                    onClick={handleSignOut}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600 font-medium"
                                >
                                    Sign Out
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <nav className="border-y border-gray-200 bg-white">
                <ul className="flex justify-center items-center gap-12 py-3 text-sm font-medium text-gray-700">
                    <li className="hover:text-purple-600 cursor-pointer">About</li>
                    <li className="hover:text-purple-600 cursor-pointer">Modules</li>
                    <Link to="/blogs">
                        <li className="hover:text-purple-600 cursor-pointer">Blogs</li>
                    </Link>
                    <li className="hover:text-purple-600 cursor-pointer">Q&A section</li>
                    <li className="hover:text-purple-600 cursor-pointer">FAQ</li>
                    <li className="hover:text-purple-600 cursor-pointer">Find a member (TeamUp)</li>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;