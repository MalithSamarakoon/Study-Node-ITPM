import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import profileImage from '../assets/img.png';
import { getUser, isAdmin, isStudent, logout } from '../utils/auth';

const Navbar = () => {
    const [user, setUser] = useState(getUser());
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Re-read user from storage whenever auth changes (login / logout)
    useEffect(() => {
        const syncUser = () => setUser(getUser());
        window.addEventListener('authChange', syncUser);
        return () => window.removeEventListener('authChange', syncUser);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setShowDropdown(false);
    }, [location.pathname]);

    const handleSignOut = () => {
        logout();
        setUser(null);
        navigate('/login');
    };

    const admin = isAdmin();
    const student = isStudent();

    const navLinkClass = (path) =>
        `hover:text-purple-600 cursor-pointer transition-colors ${
            location.pathname === path ? 'text-purple-600 font-semibold' : ''
        }`;

    return (
        <header className="w-full sticky top-0 z-40 bg-white shadow-sm">
            {/* Top bar: logo + auth */}
            <div className="flex justify-between items-center px-8 py-4 bg-white">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600 rotate-45" />
                    <span className="text-xl font-bold text-gray-800">Study Node</span>
                </Link>

                <div className="relative">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {/* Role badge */}
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                admin
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-blue-100 text-blue-700'
                            }`}>
                                {admin ? 'Admin' : 'Student'}
                            </span>
                            <span className="text-sm font-medium text-gray-600">
                                Hi, {user.username}
                            </span>
                            <button
                                onClick={() => setShowDropdown(prev => !prev)}
                                className="focus:outline-none"
                                aria-label="Profile menu"
                            >
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-purple-400 transition-all"
                                />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login">
                                <button className="text-gray-600 font-medium hover:text-purple-600 transition-colors">
                                    Log in
                                </button>
                            </Link>
                            <Link to="/registration">
                                <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                                    Sign up
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Dropdown */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
                                <p className="text-xs text-gray-500">{admin ? 'Administrator' : 'Student'}</p>
                            </div>
                            <ul className="py-1">
                                <li>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                    >
                                        Sign Out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <nav className="border-t border-gray-200 bg-white">
                <ul className="flex justify-center items-center gap-10 py-3 text-sm font-medium text-gray-700">
                    <li className={navLinkClass('/')}>
                        <Link to="/">Home</Link>
                    </li>
                    <li className={navLinkClass('/resources/modules')}>
                        <Link to="/resources/modules">Modules</Link>
                    </li>
                    <li className={navLinkClass('/blogs')}>
                        <Link to="/blogs">Blogs</Link>
                    </li>
                    {/* Upload Resource: students only */}
                    {student && (
                        <li className={navLinkClass('/resources/upload')}>
                            <Link to="/resources/upload">Upload Resource</Link>
                        </li>
                    )}
                    {student && (
                        <li className={navLinkClass('/resources/my-uploads')}>
                            <Link to="/resources/my-uploads">My Uploads</Link>
                        </li>
                    )}
                    {/* Admin nav links */}
                    {admin && (
                        <>
                            <li className={navLinkClass('/admin/modules')}>
                                <Link to="/admin/modules">Manage Modules</Link>
                            </li>
                            <li className={navLinkClass('/admin/resources')}>
                                <Link to="/admin/resources">Approve Resources</Link>
                            </li>
                        </>
                    )}
                    <li className="hover:text-purple-600 cursor-pointer">Q&A</li>
                    <li className="hover:text-purple-600 cursor-pointer">FAQ</li>
                    <li className="hover:text-purple-600 cursor-pointer">Find a Member</li>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;
