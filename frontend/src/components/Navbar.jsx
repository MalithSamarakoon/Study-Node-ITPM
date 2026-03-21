import React, {useState} from 'react';
import {Link} from 'react-router-dom'
import profileImage from '../assets/img.png'

const Navbar = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <header className="w-full">
            <div className="flex justify-between items-center px-8 py-4 bg-white">
                <div className="flex items-center gap-2">
                    {/* Your Purple Logo would go here */}
                    <div className="w-8 h-8 bg-purple-600 rotate-45"></div>
                    <span className="text-xl font-bold text-gray-800">Study Node</span>
                </div>

                <div className="relative">
                    {isLoggedIn ? (
                        <button onClick={() => setShowDropdown(!showDropdown)}>
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border border-gray-200"
                            />
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button className="text-gray-600 font-medium">Log in</button>
                            <Link to={"/registration"}>
                                <button className="bg-purple-600 text-white px-4 py-2 rounded-md">Sign up</button>
                            </Link>
                        </div>
                    )}

                    {/* Profile Dropdown logic */}
                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                            <ul className="py-2">
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">My Profile</li>
                                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">Sign Out</li>
                            </ul>
                        </div>
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
                    <li className="hover:text-purple-600 cursor-pointer">Find a member (TeamUp)</li>
                </ul>
            </nav>


        </header>
    );
};
export default Navbar;