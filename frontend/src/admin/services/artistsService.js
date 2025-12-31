import api from './api';
import { handleError } from "./errorHandler";

const ARTIST_API = '/artists';

export const getAllArtists = async () => {
    try {
        const response = await api.get(ARTIST_API);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const getArtistById = async (id) => {
    try {
        const response = await api.get(`${ARTIST_API}/${id}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const createArtist = async (artistData) => {
    try {
        const response = await api.post(ARTIST_API, artistData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const updateArtist = async (id, artistData) => {
    try {
        const response = await api.put(`${ARTIST_API}/${id}`, artistData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
};

export const deleteArtist = async (id) => {
    try {
        const response = await api.delete(`${ARTIST_API}/${id}`);
        return response.data;
    } catch (error) {
        handleError(error);
    }
};
