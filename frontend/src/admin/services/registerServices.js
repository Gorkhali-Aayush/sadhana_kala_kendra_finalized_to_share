import api from "./api";
import { handleError } from "./errorHandler";

const RegisterService = {
    getAllStudents: async () => {
        try {
            const response = await api.get("/register/students", { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    getStudentById: async (id) => {
        try {
            const response = await api.get(`/register/students/${id}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    createStudent: async (studentData) => {
        try {
            const response = await api.post("/register/students", studentData, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    updateStudent: async (id, studentData) => {
        try {
            const response = await api.put(`/register/students/${id}`, studentData, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    deleteStudent: async (id) => {
        try {
            const response = await api.delete(`/register/students/${id}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    createPublicRegistration: async (data) => {
        try {
            const response = await api.post("/register", data);
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    getAllRegistrations: async () => {
        try {
            const response = await api.get(`/register/registration`, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    getRegistrationById: async (id) => {
        try {
            const response = await api.get(`/register/registration/${id}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    createRegistration: async (student_id, course_id) => {
        try {
            const response = await api.post("/register/registration", { student_id, course_id }, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    updateRegistration: async (id, registrationData) => {
        try {
            const response = await api.put(`/register/registration/${id}`, registrationData, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    updateRegistrationStatus: async (id, status) => {
        try {
            const response = await api.patch(`/register/registration/${id}/status`, { status }, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },

    deleteRegistration: async (id) => {
        try {
            const response = await api.delete(`/register/registration/${id}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            handleError(error);
        }
    },
};

export default RegisterService;
