import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
        try {
            const parsed = JSON.parse(token);
            if (parsed.state?.token) {
                config.headers.Authorization = `Bearer ${parsed.state.token}`;
            }
        } catch (e) {
            console.error('Error parsing token:', e);
        }
    }
    return config;
});

export default api;
