import { Navigate, useLocation } from 'react-router-dom';
import { getUser, isAdmin, isStudent } from '../utils/auth';

/**
 * Wraps a route so that unauthenticated users are sent to /login.
 */
export const PrivateRoute = ({ children }) => {
    const user = getUser();
    const location = useLocation();
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};

/**
 * Wraps a route that is only accessible by admins.
 * Redirects students to /resources/modules, and unauthenticated users to /login.
 */
export const AdminRoute = ({ children }) => {
    const user = getUser();
    const location = useLocation();
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (!isAdmin()) {
        return <Navigate to="/resources/modules" replace />;
    }
    return children;
};

/**
 * Wraps a route that is only accessible by students.
 * Redirects admins to /admin/modules, and unauthenticated users to /login.
 */
export const StudentRoute = ({ children }) => {
    const user = getUser();
    const location = useLocation();
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (!isStudent() && !isAdmin()) {
        return <Navigate to="/" replace />;
    }
    return children;
};
