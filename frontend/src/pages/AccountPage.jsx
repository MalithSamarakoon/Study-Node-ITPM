import React, { useState, useEffect } from 'react';
import api from '../api/api.js';
import ProfileEdit from '../components/ProfileEdit';
import ProfileView from '../components/ProfileView';

const AccountPage = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch user data on component load
    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
            alert("Failed to load profile. Please login again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-10">Loading Study Node Profile...</div>;

    if (!user) {
        return (
            <div className="text-center mt-10 text-red-500">
                Error: Could not retrieve user details. Please try logging in again.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Account Settings</h2>

            {isEditing ? (
                <ProfileEdit
                    user={user}
                    onCancel={() => setIsEditing(false)}
                    onSave={(updatedUser) => {
                        setUser(updatedUser);
                        setIsEditing(false);
                    }}
                />
            ) : (
                <ProfileView
                    user={user}
                    onEdit={() => setIsEditing(true)}
                />
            )}
        </div>
    );
};

export default AccountPage;


