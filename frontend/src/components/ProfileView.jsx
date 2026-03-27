import React from 'react';

const ProfileView = ({ user, onEdit }) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-gray-500 text-sm">Username</label>
                    <p className="font-medium">{user.username}</p>
                </div>
                <div>
                    <label className="text-gray-500 text-sm">Student ID</label>
                    <p className="font-medium">{user.studentId}</p>
                </div>
                <div>
                    <label className="text-gray-500 text-sm">Email Address</label>
                    <p className="font-medium">{user.email}</p>
                </div>
                <div>
                    <label className="text-gray-500 text-sm">Phone Number</label>
                    <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
                </div>
            </div>
            <button
                onClick={onEdit}
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
                Edit Profile
            </button>
        </div>
    );
};

export default ProfileView;