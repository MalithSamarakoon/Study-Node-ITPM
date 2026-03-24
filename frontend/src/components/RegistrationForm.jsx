import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import {useNavigate} from "react-router-dom";

const RegistrationForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        studentId: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validation = {
        length: formData.password.length >= 8,
        complexity: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
        digit: /\d/.test(formData.password),
        special: /[@#$%^&+=!]/.test(formData.password)
    };


    const passwordsMatch = formData.password === formData.confirmPassword;
    const showMatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if(errors[name]){
            setErrors({...errors, [name]: ''});
        }
    };

    const validateField = (name, value) => {
        let errorMsg = '';
        if(value.trim() === '') return '';

        switch (name) {
            case 'studentId':
                const idRegex = /^IT\d{8}$/;
                if(!idRegex.test(value)){
                    errorMsg = "Student ID must start with 'IT' followed by 8 digits.";
                }
                break;

            case 'email':
                if(!value.includes('@')){
                    errorMsg = "Please enter a valid email address.";
                }
                break;

            case 'phone':
                const phoneRegex = /^\d{10}$/;
                if(!phoneRegex.test(value)){
                    errorMsg = "Phone number must have exactly 10 digits.";
                }
                break;
            default:
                break;
        }
        return errorMsg;
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const hasErrors = Object.values(errors).some(msg => msg !== '');
        if (hasErrors) {
            toast.error("Please fix the errors before submitting.");
            return;
        }

        if (Object.values(validation).every(Boolean) && passwordsMatch) {
            setLoading(true);
            try{
                const payload = {
                    username: formData.username,
                    studentId: formData.studentId,
                    email: formData.email,
                    phoneNumber: formData.phone,
                    password: formData.password
                };

                const response = await axios.post('http://localhost:8080/api/auth/register', payload);

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify(response.data));
                window.dispatchEvent(new Event("authChange"));

                toast.success("Account created successfully!");

                setTimeout(() => {
                    navigate('/');
                }, 2000);
                setFormData({username: '', studentId: '', email: '', phone: '', password: ''});
            }catch(error){
                const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
                toast.error(errorMessage);

            }finally {
                setLoading(false);
            }
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
                            autoComplete={"off"}
                            value={formData[field.name]}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full border rounded-xl p-2 focus:outline-none focus:ring-2 transition-all ${
                                errors[field.name]
                                    ? 'border-red-500 focus:ring-red-200 bg-red-50'
                                    : 'border-gray-400 focus:ring-purple-300'
                            }`}
                            required
                        />
                        {errors[field.name] && (
                            <span className="text-red-500 text-[10px] mt-1 ml-1 font-medium animate-bounce">
                                {errors[field.name]}
                            </span>
                        )}
                    </div>
                ))}


                <div className="flex flex-col">
                    <label className="text-[#6366f1] font-semibold text-sm mb-1 ml-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        autoComplete={"new-password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full border border-gray-400 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                        required
                    />

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


            <button
                type="submit"
                disabled={!Object.values(validation).every(Boolean) || !passwordsMatch}
                className="mt-4 w-full bg-[#a855f7] hover:bg-[#9333ea] disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-2xl shadow-md transform active:scale-95 transition-all cursor-pointer"
            >
                {loading ? "Registering..." : "Register"}
            </button>
        </form>
    );
};

export default RegistrationForm;