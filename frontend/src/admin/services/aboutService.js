import api from "./api.js";
import { handleError } from "./errorHandler";
const API_URL = '/about';

// --- BOD OPERATIONS ---

export const getAllBOD = async () => {
    try {
        const response = await api.get(`${API_URL}/bod`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createBOD = async (bodData) => {
    const formData = new FormData();
    
    // Append text fields
    formData.append('name', bodData.name || '');
    formData.append('designation', bodData.designation || '');
    formData.append('bio', bodData.bio || '');
    formData.append('details_content', bodData.details_content || '');
    formData.append('slug', bodData.slug || '');
    formData.append('seo_title', bodData.seo_title || '');
    formData.append('seo_description', bodData.seo_description || '');
    formData.append('seo_keywords', bodData.seo_keywords || '');
    formData.append('display_order', bodData.display_order || 0);
    
    // Append the image file with the correct field name that multer expects
    if (bodData.profile_image_file) {
        formData.append('profile_image', bodData.profile_image_file);
    }

    try {
        const response = await api.post(`${API_URL}/bod`, formData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateBOD = async (id, bodData) => {
    const formData = new FormData();
    
    // Append text fields
    formData.append('name', bodData.name || '');
    formData.append('designation', bodData.designation || '');
    formData.append('bio', bodData.bio || '');
    formData.append('details_content', bodData.details_content || '');
    formData.append('slug', bodData.slug || '');
    formData.append('seo_title', bodData.seo_title || '');
    formData.append('seo_description', bodData.seo_description || '');
    formData.append('seo_keywords', bodData.seo_keywords || '');
    formData.append('display_order', bodData.display_order || 0);
    
    // Only append new image if provided
    if (bodData.profile_image_file) {
        formData.append('profile_image', bodData.profile_image_file);
    }

    try {
        const response = await api.put(`${API_URL}/bod/${id}`, formData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteBOD = async (id) => {
    try {
        const response = await api.delete(`${API_URL}/bod/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};


// === TEAM MEMBERS OPERATIONS ===

export const getAllTeamMembers = async () => {
    try {
        const response = await api.get(`${API_URL}/team-members`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const getTeamMemberById = async (id) => {
    try {
        const response = await api.get(`${API_URL}/team-members/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createTeamMember = async (data) => {
    const formData = new FormData();
    
    // Append text fields
    formData.append('name', data.name || '');
    formData.append('subtitle', data.subtitle || '');
    formData.append('display_order', data.display_order || 0);
    
    // Append the image file with the correct field name that multer expects
    if (data.image_file) {
        formData.append('image_url', data.image_file);
    }

    try {
        const response = await api.post(`${API_URL}/team-members`, formData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateTeamMember = async (id, data) => {
    const formData = new FormData();
    
    // Append text fields
    formData.append('name', data.name || '');
    formData.append('subtitle', data.subtitle || '');
    formData.append('display_order', data.display_order || 0);
    
    // Only append new image if provided
    if (data.image_file) {
        formData.append('image_url', data.image_file);
    }

    try {
        const response = await api.put(`${API_URL}/team-members/${id}`, formData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteTeamMember = async (id) => {
    try {
        const response = await api.delete(`${API_URL}/team-members/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

// --- PROGRAMS OPERATIONS ---

export const getAllPrograms = async () => {
    try {
        const response = await api.get(`${API_URL}/programs`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProgramById = async (id) => {
    try {
        const response = await api.get(`${API_URL}/programs/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const createProgram = async (data) => {
    const formData = new FormData();
    
    formData.append('program_date', data.program_date || '');
    formData.append('title', data.title || '');
    formData.append('slug', data.slug || '');
    formData.append('description', data.description || '');
    formData.append('seo_title', data.seo_title || '');
    formData.append('seo_description', data.seo_description || '');
    formData.append('seo_keywords', data.seo_keywords || '');
    formData.append('display_order', data.display_order || 0);
    
    if (data.image_file) {
        formData.append('image_url', data.image_file);
    }

    try {
        const response = await api.post(`${API_URL}/programs`, formData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const updateProgram = async (id, data) => {
    const formData = new FormData();
    
    formData.append('program_date', data.program_date || '');
    formData.append('title', data.title || '');
    formData.append('slug', data.slug || '');
    formData.append('description', data.description || '');
    formData.append('seo_title', data.seo_title || '');
    formData.append('seo_description', data.seo_description || '');
    formData.append('seo_keywords', data.seo_keywords || '');
    formData.append('display_order', data.display_order || 0);
    
    if (data.image_file) {
        formData.append('image_url', data.image_file);
    }

    try {
        const response = await api.put(`${API_URL}/programs/${id}`, formData);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

export const deleteProgram = async (id) => {
    try {
        const response = await api.delete(`${API_URL}/programs/${id}`);
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};