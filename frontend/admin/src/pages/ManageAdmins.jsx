import React, { useEffect, useState } from 'react';
import { getAdmins, deactivateAdmin } from '../services/adminService';
import useAuthStore from '../stores/useAuthStore';
import { UserPlus, Users, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import CreateAdminModal from '../components/admin/CreateAdminModal';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState('all'); // all, active, inactive
    const { token, user } = useAuthStore();

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await getAdmins(token);
            setAdmins(data);
        } catch (err) {
            console.error('Failed to fetch admins:', err);
            alert('Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAdmins();
        }
    }, [token]);

    const handleDeactivate = async (adminId, adminName) => {
        if (window.confirm(`Are you sure you want to deactivate ${adminName}? They will no longer be able to login.`)) {
            try {
                await deactivateAdmin(adminId, token);
                alert('Admin deactivated successfully');
                fetchAdmins(); // Refresh list
            } catch (err) {
                console.error('Failed to deactivate admin:', err);
                alert(err.response?.data?.message || 'Failed to deactivate admin');
            }
        }
    };

    const handleAdminCreated = () => {
        setShowCreateModal(false);
        fetchAdmins(); // Refresh list
    };

    const filteredAdmins = admins.filter(admin => {
        if (filter === 'active') return admin.isActive;
        if (filter === 'inactive') return !admin.isActive;
        return true;
    });

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'central_admin': return 'bg-purple-100 text-purple-800';
            case 'state_admin': return 'bg-blue-100 text-blue-800';
            case 'city_admin': return 'bg-green-100 text-green-800';
            case 'news_admin': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                        <Users className="mr-3" size={32} />
                        Manage Admins
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {user?.role === 'central_admin'
                            ? 'Create and manage State, Central, and News Admins'
                            : 'Create and manage City Admins in your state'}
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                    <UserPlus size={20} />
                    <span>Create Admin</span>
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex space-x-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    All ({admins.length})
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Active ({admins.filter(a => a.isActive).length})
                </button>
                <button
                    onClick={() => setFilter('inactive')}
                    className={`px-4 py-2 rounded ${filter === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                    Inactive ({admins.filter(a => !a.isActive).length})
                </button>
            </div>

            {/* Admins Table */}
            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading admins...</p>
                </div>
            ) : filteredAdmins.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Users size={64} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-xl">No admins found</p>
                    <p className="text-gray-400 mt-2">Click "Create Admin" to add your first admin</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAdmins.map((admin) => (
                                <tr key={admin._id} className={!admin.isActive ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                        <div className="text-sm text-gray-500">{admin.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{admin.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(admin.role)}`}>
                                            {admin.role.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {admin.city && admin.state ? `${admin.city}, ${admin.state}` :
                                            admin.state ? admin.state :
                                                admin.city ? admin.city :
                                                    '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {admin.isActive ? (
                                            <span className="flex items-center text-green-600">
                                                <CheckCircle size={16} className="mr-1" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-600">
                                                <XCircle size={16} className="mr-1" />
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {admin.isActive && (
                                            <button
                                                onClick={() => handleDeactivate(admin._id, admin.name)}
                                                className="text-red-600 hover:text-red-900 flex items-center"
                                            >
                                                <Trash2 size={16} className="mr-1" />
                                                Deactivate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Admin Modal */}
            {showCreateModal && (
                <CreateAdminModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleAdminCreated}
                />
            )}
        </div>
    );
};

export default ManageAdmins;
