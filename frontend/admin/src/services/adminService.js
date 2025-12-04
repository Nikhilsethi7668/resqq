import api from './api';

// Create new admin
export const createAdmin = async (adminData, token) => {
    const response = await api.post('/admin/users/create', adminData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Get all admins created by current user
export const getAdmins = async (token) => {
    const response = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Get specific admin details
export const getAdminDetails = async (id, token) => {
    const response = await api.get(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Deactivate admin
export const deactivateAdmin = async (id, token) => {
    const response = await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Update admin
export const updateAdmin = async (id, data, token) => {
    const response = await api.put(`/admin/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
