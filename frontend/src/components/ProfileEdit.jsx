import React, { useState } from 'react';
import api from '../api/api.js';

const ProfileEdit = ({ user, onCancel, onSave }) => {
    const [formData, setFormData] = useState({ ...user });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Note: We'll build this PUT endpoint in the next step
            const response = await api.put(`/users/update`, formData);
            onSave(response.data);
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Error updating profile.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="border p-2 rounded"
                    disabled // Usually, usernames are locked after registration
                />
                <input
                    name="studentId"
                    value={formData.studentId}
                    className="border p-2 rounded bg-gray-100"
                    disabled
                />
                <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border p-2 rounded"
                />
                <input
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="border p-2 rounded"
                />
            </div>
            <div className="flex gap-4 mt-6">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save Changes</button>
                <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
            </div>
        </form>
    );
};

export default ProfileEdit;