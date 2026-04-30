// Auth utility helpers
import axios from "axios";

export const getUser = () => {
    try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const getToken = () => {
    const user = getUser();
    return user?.token || null;
};

export const isLoggedIn = () => Boolean(getUser());

/**
 * Normalise roles from the backend response.
 * The backend sends: { roles: ["ROLE_ADMIN"] }
 * Older code may have stored: { role: "ROLE_ADMIN" }
 * This handles both.
 */
const getRoles = () => {
    const user = getUser();
    if (!user) return [];

    // Array format: { roles: ["ROLE_ADMIN"] }
    if (Array.isArray(user.roles) && user.roles.length > 0) {
        return user.roles;
    }

    // Legacy single-string format: { role: "ROLE_ADMIN" }
    if (user.role) {
        return [user.role];
    }

    return [];
};

export const isAdmin = () => {
    const roles = getRoles();
    return roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
};

export const isStudent = () => {
    const roles = getRoles();
    return roles.includes('ROLE_STUDENT') || roles.includes('STUDENT');
};

export const logout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authChange'));
};

export const deleteAccount = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };
    return axios.delete("http://localhost:8080/api/users/me", config);
};
