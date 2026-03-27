import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // We parse the 'user' object from localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // If the user object or the token doesn't exist, kick them to /login
    if (!user || !user.token) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, let them through to the page they requested
    return children;
};

export default ProtectedRoute;