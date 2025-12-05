import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { LogOut, Menu } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <nav className="bg-slate-900 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/admin/dashboard" className="text-2xl font-bold text-red-500 tracking-wider flex items-center">
                        <span className="bg-red-600 text-white px-2 py-1 rounded mr-2 text-lg">ADMIN</span>
                        ResQ Connect
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        {user && (['city_admin', 'state_admin', 'central_admin'].includes(user.role)) && (
                            <Link to="/admin/dashboard" className="hover:text-red-400 transition-colors">Dashboard</Link>
                        )}
                        {user && (['news_admin', 'central_admin'].includes(user.role)) && (
                            <Link to="/admin/news-dashboard" className="hover:text-red-400 transition-colors">📰 News Dashboard</Link>
                        )}
                        {user && (['central_admin', 'state_admin'].includes(user.role)) && (
                            <Link to="/admin/manage-admins" className="hover:text-red-400 transition-colors">Manage Admins</Link>
                        )}
                        {user && user.role === 'central_admin' && (
                            <Link to="/admin/ml-dashboard" className="hover:text-red-400 transition-colors">🤖 ML Dashboard</Link>
                        )}
                        {user && (['news_admin', 'central_admin'].includes(user.role)) && (
                            <Link to="/admin/news/create" className="hover:text-red-400 transition-colors">Create News</Link>
                        )}
                        {user && (
                            <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-gray-700">
                                <div className="text-right hidden lg:block">
                                    <p className="text-sm font-semibold">{user.name}</p>
                                    <p className="text-xs text-gray-400 uppercase">{user.role.replace('_', ' ')}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
