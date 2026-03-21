import React, { useState } from 'react';

const RegistrationForm = () => {
    // 1. State Initialization for all form fields [cite: 85, 99]
    const [formData, setFormData] = useState({
        username: '',
        studentId: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    // 2. Password Validation Logic: Tests the input against your 4 rules [cite: 10, 11, 12, 100]
    const validation = {
        length: formData.password.length >= 8,
        complexity: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
        digit: /\d/.test(formData.password),
        special: /[@#$%^&+=!]/.test(formData.password)
    };

    // 3. Confirm Password Logic: Checks if fields match after user starts typing
    const passwordsMatch = formData.password === formData.confirmPassword;
    const showMatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Final check before calling the Feature Branch 2 API [cite: 102]
        if (Object.values(validation).every(Boolean) && passwordsMatch) {
            console.log("Form submitted to /api/auth/register:", formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input Fields Wrapper */}
            <div className="space-y-4">
                {[
                    { label: 'Username', name: 'username', type: 'text' },
                    { label: 'Student ID', name: 'studentId', type: 'text' },
                    { label: 'Email', name: 'email', type: 'email' },
                    { label: 'Phone Number', name: 'phone', type: 'text' },
                ].map((field) => (
                    <div key={field.name} className="flex flex-col">
                        <label className="text-[#6366f1] font-semibold text-sm mb-1 ml-1">{field.label}</label>
                        <input
                            type={field.type}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleChange}
                            className="w-full border border-gray-400 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                            required
                        />
                    </div>
                ))}

                {/* Password Field with Rules  */}
                <div className="flex flex-col">
                    <label className="text-[#6366f1] font-semibold text-sm mb-1 ml-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-gray-400 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                        required
                    />
                    {/* Dynamic Password Rules List  */}
                    <ul className="mt-3 grid grid-cols-1 gap-1 text-xs px-1">
                        <li className={`flex items-center gap-2 ${validation.length ? 'text-green-600' : 'text-red-500'}`}>
                            <span className="text-[10px]">{validation.length ? '✔' : '●'}</span> Minimum 8 characters
                        </li>
                        <li className={`flex items-center gap-2 ${validation.complexity ? 'text-green-600' : 'text-red-500'}`}>
                            <span className="text-[10px]">{validation.complexity ? '✔' : '●'}</span> Uppercase & Lowercase letters
                        </li>
                        <li className={`flex items-center gap-2 ${validation.digit ? 'text-green-600' : 'text-red-500'}`}>
                            <span className="text-[10px]">{validation.digit ? '✔' : '●'}</span> At least one number
                        </li>
                        <li className={`flex items-center gap-2 ${validation.special ? 'text-green-600' : 'text-red-500'}`}>
                            <span className="text-[10px]">{validation.special ? '✔' : '●'}</span> Special character (@, #, $, %)
                        </li>
                    </ul>
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col">
                    <label className="text-[#6366f1] font-semibold text-sm mb-1 ml-1">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 transition-all ${
                            showMatchError ? 'border-red-500 focus:ring-red-200' : 'border-gray-400 focus:ring-purple-300'
                        }`}
                        required
                    />
                    {showMatchError && (
                        <span className="text-red-500 text-[11px] mt-1 ml-1 font-medium">
              Passwords do not match
            </span>
                    )}
                </div>
            </div>

            {/* Register Button - Matches the purple pill design */}
            <button
                type="submit"
                disabled={!Object.values(validation).every(Boolean) || !passwordsMatch}
                className="mt-4 w-full bg-[#a855f7] hover:bg-[#9333ea] disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-2xl shadow-md transform active:scale-95 transition-all cursor-pointer"
            >
                Register
            </button>
        </form>
    );
};

export default RegistrationForm;