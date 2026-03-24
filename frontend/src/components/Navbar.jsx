import React from 'react';
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <header className="w-full">
            <div className="flex justify-between items-center px-8 py-4 bg-white">
                <div className="flex items-center gap-2">
                    {/* Your Purple Logo would go here */}
                    <div className="w-8 h-8 bg-purple-600 rotate-45"></div>
                    <span className="text-xl font-bold text-gray-800">Study Node</span>
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