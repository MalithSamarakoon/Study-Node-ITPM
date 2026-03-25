import React from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="w-full">
            <div className="flex justify-between items-center px-8 py-4 bg-white">
                <div className="flex items-center gap-2">
                    {/* Your Purple Logo would go here */}
                    <div className="w-8 h-8 bg-purple-600 rotate-45"></div>
                    <span className="text-xl font-bold text-gray-800">Study Node</span>
                </div>
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-[#8a512a]">
                                {user?.name}
                            </span>
                            <button
                                onClick={logout}
                                className="rounded-lg border border-[#e8a89f] bg-white px-3 py-1.5 text-sm font-semibold text-[#c65c50] hover:bg-[#fef4f2]"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-semibold text-[#8a512a] hover:underline">Login</Link>
                            <Link to="/register" className="rounded-lg bg-[#ef8f31] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#df7f21]">Register</Link>
                        </>
                    )}
                </div>
            </div>

            <nav className="border-y border-gray-200 bg-white">
                <ul className="flex justify-center items-center gap-12 py-3 text-sm font-medium text-gray-700">
                    <li className="hover:text-purple-600 cursor-pointer">About</li>
                    <li className="hover:text-purple-600 cursor-pointer">Modules</li>
                    <li className="hover:text-purple-600 cursor-pointer">Blogs</li>
                    <li className="hover:text-purple-600 cursor-pointer">Q&A section</li>
                    <li className="hover:text-purple-600 cursor-pointer">FAQ</li>
                    <li>
                        <Link to="/teams" className="hover:text-purple-600 cursor-pointer">Find a member (TeamUp)</Link>
                    </li>
                    <li>
                        <Link to="/teams/new" className="hover:text-purple-600 cursor-pointer">Create Team</Link>
                    </li>
                    <li>
                        <Link to="/admin/teamup" className="hover:text-purple-600 cursor-pointer">Manage TeamUp</Link>
                    </li>
                </ul>
            </nav>


        </header>
    );
};
export default Navbar;