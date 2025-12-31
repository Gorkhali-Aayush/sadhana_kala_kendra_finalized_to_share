import api from './api';
import { handleError } from "./errorHandler";

const EVENTS_API = '/events';

export const getAllEvents = async (category = null) => {
    try {
        const url = category ? `${EVENTS_API}?category=${category}` : EVENTS_API;
        const response = await api.get(url, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getUpcomingEvents = async () => {
    try {
        const response = await api.get(`${EVENTS_API}?category=upcoming`, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getPastEvents = async () => {
    try {
        const response = await api.get(`${EVENTS_API}?category=past`, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const createEvent = async (data) => {
    try {
        const response = await api.post(EVENTS_API, data, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const updateEvent = async (id, data) => {
    try {
        const response = await api.put(`${EVENTS_API}/${id}`, data, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const deleteEvent = async (id) => {
    try {
        const response = await api.delete(`${EVENTS_API}/${id}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};
