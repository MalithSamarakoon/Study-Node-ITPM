import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const quizClient = axios.create({
    baseURL: `${API_BASE_URL}/api/quiz`
});

export const getStudentId = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user.studentId || null;
    } catch {
        return null;
    }
};

export const getCurrentUsername = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user.username || "admin";
    } catch {
        return "admin";
    }
};

export const fetchModules = async () => {
    const { data } = await quizClient.get("/modules");
    return data;
};

export const createModule = async ({ title, description }) => {
    const payload = {
        title,
        description: description || "",
        createdBy: getCurrentUsername()
    };
    const { data } = await quizClient.post("/modules", payload);
    return data;
};

export const updateModule = async (moduleId, { title, description }) => {
    const payload = {
        title,
        description: description || "",
        createdBy: getCurrentUsername()
    };
    const { data } = await quizClient.put(`/modules/${moduleId}`, payload);
    return data;
};

export const deleteModule = async (moduleId) => {
    await quizClient.delete(`/modules/${moduleId}`);
};

export const fetchModuleQuizzes = async (moduleId) => {
    const studentId = getStudentId();
    const { data } = await quizClient.get(`/modules/${moduleId}/quizzes`, {
        params: studentId ? { studentId } : {}
    });
    return data;
};

export const fetchQuizById = async (quizId) => {
    const { data } = await quizClient.get(`/quizzes/${quizId}`);
    return data;
};

export const createQuiz = async (moduleId, payload) => {
    const request = {
        ...payload,
        createdBy: payload.createdBy || getCurrentUsername()
    };
    const { data } = await quizClient.post(`/modules/${moduleId}/quizzes`, request);
    return data;
};

export const updateQuiz = async (quizId, payload) => {
    const request = {
        ...payload,
        createdBy: payload.createdBy || getCurrentUsername()
    };
    const { data } = await quizClient.put(`/quizzes/${quizId}`, request);
    return data;
};

export const deleteQuiz = async (quizId) => {
    await quizClient.delete(`/quizzes/${quizId}`);
};

export const submitQuizAttempt = async (quizId, answers) => {
    const studentId = getStudentId();
    if (!studentId) {
        throw new Error("Missing student profile. Please sign out and sign in again.");
    }
    const payload = {
        studentId,
        answers
    };
    const { data } = await quizClient.post(`/quizzes/${quizId}/attempts`, payload);
    return data;
};

export const fetchAttemptResult = async (attemptId) => {
    const { data } = await quizClient.get(`/attempts/${attemptId}`);
    return data;
};

export const fetchAttemptHistory = async () => {
    const studentId = getStudentId();
    if (!studentId) {
        return [];
    }
    const { data } = await quizClient.get(`/students/${studentId}/attempts`);
    return data;
};
