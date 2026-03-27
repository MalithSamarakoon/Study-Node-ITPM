import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import googleicon from '../assets/google-icon.png';
import api from '../api/api.js';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // To show errors to the student
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {

            const response = await api.post("/auth/signin", {
                username,
                password
            });

            // 2. If we get a token back, save the user object in Local Storage
            if (response.data.token) {
                localStorage.setItem("user", JSON.stringify(response.data));

                // 3. Redirect the student to the dashboard or home
                navigate("/");
            }
        } catch (error) {
            // 4. Handle errors (e.g., wrong password or server down)
            const resMessage =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();

            setMessage("Invalid username or password. Please try again.");
            setLoading(false);
        }
    };



    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            {/* Login Card */}
            <div className="w-full max-w-sm p-8 border-2 border-purple-400 rounded-[2.5rem] shadow-sm bg-white mx-4">

                <h2 className="text-2xl font-bold text-center text-blue-700 mb-8">
                    Sign In
                </h2>

                {/* Error Message Display */}
                {message && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm text-center">
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Username Field */}
                    <div>
                        <label className="block text-blue-700 font-semibold mb-2 ml-1">
                            Username
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-blue-700 font-semibold mb-2 ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Added Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-2xl transition duration-200 mt-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? "Authenticating..." : "Login"}
                    </button>
                </form>

                {/* Google Sign-In */}
                <div className="mt-6">
                    <button className="flex items-center justify-center w-full py-2 border border-gray-500 rounded-full text-blue-800 font-medium hover:bg-gray-50 transition duration-200">
                        <img
                            src={googleicon}
                            alt="Google logo"
                            className="w-5 h-5 mr-3"
                        />
                        Sign in with Google
                    </button>
                </div>

                {/* Helper Links */}
                <div className="mt-6 text-center space-y-4">
                    <div>
                        <Link to="/forgot-password" size="sm" className="text-blue-600 font-semibold hover:underline">
                            Forgot Password ?
                        </Link>
                    </div>

                    <div className="text-blue-700 font-semibold">
                        Don't have an account?{' '}
                        <Link to="/registration" className="hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;