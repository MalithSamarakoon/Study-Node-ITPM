import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const quizClient = axios.create({
    baseURL: `${API_BASE_URL}/api/quiz`
});

export const getStudentId = () => {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user.studentId || "IT20260001";
    } catch {
        return "IT20260001";
    }
};

export const fetchModules = async () => {
    const { data } = await quizClient.get("/modules");
    return data;
};

export const fetchModuleQuizzes = async (moduleId) => {
    const studentId = getStudentId();
    const { data } = await quizClient.get(`/modules/${moduleId}/quizzes`, {
        params: { studentId }
    });
    return data;
};

export const fetchQuizById = async (quizId) => {
    const { data } = await quizClient.get(`/quizzes/${quizId}`);
    return data;
};

export const submitQuizAttempt = async (quizId, answers) => {
    const studentId = getStudentId();
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
    const { data } = await quizClient.get(`/students/${studentId}/attempts`);
    return data;
};
