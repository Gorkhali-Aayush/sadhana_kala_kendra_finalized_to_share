import api from './api';
import { handleError } from "./errorHandler";

const TEACHERS_API = '/teachers'; 

const createFormData = (data, isUpdate) => {
    const formData = new FormData();
    
    formData.append('full_name', data.full_name);
    formData.append('specialization', data.specialization || '');

    if (data.profile_image_file) {
        formData.append('profile_image', data.profile_image_file);
    } else if (isUpdate && data.existing_profile_image === '') {
        formData.append('clear_image', 'true');
    }
    
    return formData;
};

export const getAllTeachers = async () => {
    try {
        const response = await api.get(TEACHERS_API, { withCredentials: true }); 
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const createTeacher = async (data) => {
    try {
        const formData = createFormData(data, false);
        const response = await api.post(TEACHERS_API, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const updateTeacher = async (id, data) => {
    try {
        const formData = createFormData(data, true);
        const response = await api.put(`${TEACHERS_API}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const deleteTeacher = async (id) => {
    try {
        const response = await api.delete(`${TEACHERS_API}/${id}`, { withCredentials: true }); 
        return response.data;
    } catch (error) {
        handleError(error);
    }
};
