import React, { useState } from 'react';
import { createAdmin } from '../../services/adminService';
import useAuthStore from '../../stores/useAuthStore';
import { X, UserPlus } from 'lucide-react';

const CreateAdminModal = ({ onClose, onSuccess }) => {
    const { token, user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: user?.role === 'central_admin' ? 'state_admin' : 'city_admin',
        city: '',
        state: user?.role === 'state_admin' ? user.state : '',
        aadhar: ''
    });

    // Role options based on current user's role
    const getRoleOptions = () => {
        if (user?.role === 'central_admin') {
            return [
                { value: 'state_admin', label: 'State Admin' },
                { value: 'city_admin', label: 'City Admin' },
                { value: 'central_admin', label: 'Central Admin' },
                { value: 'news_admin', label: 'News Admin' }
            ];
        } else if (user?.role === 'state_admin') {
            return [
                { value: 'city_admin', label: 'City Admin' }
            ];
        }
        return [];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            alert('Please fill in all required fields');
            return;
        }

        if (formData.role === 'city_admin' && (!formData.city || !formData.state)) {
            alert('City and State are required for City Admin');
            return;
        }

        if (formData.role === 'state_admin' && !formData.state) {
            alert('State is required for State Admin');
            return;
        }

        try {
            setLoading(true);
            await createAdmin(formData, token);
            alert('Admin created successfully!');
            onSuccess();
        } catch (err) {
            console.error('Failed to create admin:', err);
            alert(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const showCityField = formData.role === 'city_admin';
    const showStateField = formData.role === 'city_admin' || formData.role === 'state_admin';
    const isStateReadOnly = user?.role === 'state_admin';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <UserPlus className="mr-2" size={24} />
                        Create New Admin
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            {getRoleOptions().map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter full name"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter password"
                            required
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1234567890"
                            required
                        />
                    </div>

                    {/* State (conditional) */}
                    {showStateField && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter state"
                                required
                                readOnly={isStateReadOnly}
                            />
                            {isStateReadOnly && (
                                <p className="text-xs text-gray-500 mt-1">
                                    You can only create admins in your state
                                </p>
                            )}
                        </div>
                    )}

                    {/* City (conditional) */}
                    {showCityField && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter city"
                                required
                            />
                        </div>
                    )}

                    {/* Aadhar (optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aadhar Number (Optional)
                        </label>
                        <input
                            type="text"
                            name="aadhar"
                            value={formData.aadhar}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="12-digit Aadhar number"
                            maxLength={12}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                        >
                            {loading ? 'Creating...' : 'Create Admin'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAdminModal;
