import React from 'react';
import Login from '../components/Login'; // Adjust path based on your folder structure

const LoginPage = () => {
    return (
        <div className="bg-gray-50">
            {/* You could add a simple page-level navbar here if needed */}
            <Login />
        </div>
    );
};

export default LoginPage;