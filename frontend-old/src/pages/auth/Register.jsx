import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../stores/useAuthStore';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', city: '', state: '', aadhar: '', role: 'user'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);
            login(res.data, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border rounded" required />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded" required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded" required />
                <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full p-2 border rounded" required />
                <div className="flex space-x-2">
                    <input name="city" placeholder="City" onChange={handleChange} className="w-full p-2 border rounded" required />
                    <input name="state" placeholder="State" onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <input name="aadhar" placeholder="Aadhar Number" onChange={handleChange} className="w-full p-2 border rounded" required />

                <select name="role" onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="user">User</option>
                    <option value="city_admin">City Admin</option>
                    <option value="state_admin">State Admin</option>
                    <option value="central_admin">Central Admin</option>
                    <option value="news_admin">News Admin</option>
                </select>

                <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
