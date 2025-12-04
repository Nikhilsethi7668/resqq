import axios from 'axios';

export const createApiClient = (baseURL) => {
    const api = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor to add auth token
    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return api;
};

export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        return {
            message: error.response.data?.message || 'An error occurred',
            status: error.response.status,
            data: error.response.data,
        };
    } else if (error.request) {
        // Request made but no response
        return {
            message: 'Network error. Please check your connection.',
            status: 0,
        };
    } else {
        // Something else happened
        return {
            message: error.message || 'An unexpected error occurred',
            status: -1,
        };
    }
};
