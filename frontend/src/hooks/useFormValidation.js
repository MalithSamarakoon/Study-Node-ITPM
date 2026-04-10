import { useState, useCallback } from 'react';

export const useFormValidation = (initialState) => {
    const [formData, setFormDataState] = useState(initialState);
    const [errors, setErrors] = useState({});

    const setFormData = useCallback((newFormData) => {
        setFormDataState(newFormData);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormDataState((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
        }
    };

    const validateField = (name, value) => {
        let errorMsg = '';
        if (value.trim() === '') return '';

        switch (name) {
            case 'studentId':
                const idRegex = /^IT\d{8}$/;
                if (!idRegex.test(value)) {
                    errorMsg = "Student ID must start with 'IT' followed by 8 digits.";
                }
                break;

            case 'email':
                if (!value.includes('@')) {
                    errorMsg = "Please enter a valid email address.";
                }
                break;

            case 'phone':
                const phoneRegex = /^\d{10}$/;
                if (!phoneRegex.test(value)) {
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
    };

    return {
        formData,
        setFormData,
        errors,
        setErrors,
        handleChange,
        handleBlur,
    };
};
