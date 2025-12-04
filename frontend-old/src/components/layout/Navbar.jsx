import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { LogOut, Menu } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAuthenticated = !!user;

    return (
        <nav className="bg-slate-900 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-red-500 tracking-wider flex items-center">
                        <span className="bg-red-600 text-white px-2 py-1 rounded mr-2 text-lg">SOS</span>
                        ResQ Connect
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="hover:text-red-400 transition-colors">Home</Link>
                        <Link to="/how-it-works" className="hover:text-red-400 transition-colors">How it Works</Link>
                        <Link to="/success-stories" className="hover:text-red-400 transition-colors">Success Stories</Link>
                        <Link to="/news" className="hover:text-red-400 transition-colors">News</Link>

                        {isAuthenticated ? (
                            <>
                                {user.role === 'user' && (
                                    <>
                                        <Link to="/post/new" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full font-bold transition-transform hover:scale-105">
                                            Report Emergency
                                        </Link>
                                        <Link to="/my-posts" className="hover:text-red-400 transition-colors">My Posts</Link>
                                    </>
                                )}
                                {(['city_admin', 'state_admin', 'central_admin'].includes(user.role)) && (
                                    <Link to="/admin" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold">
                                        Dashboard
                                    </Link>
                                )}
                                {(['news_admin', 'central_admin'].includes(user.role)) && (
                                    <Link to="/admin/news" className="hover:text-red-400 transition-colors">Create News</Link>
                                )}
                                <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-gray-700">
                                    <div className="text-right hidden lg:block">
                                        <p className="text-sm font-semibold">{user.name}</p>
                                        <p className="text-xs text-gray-400 uppercase">{user.role.replace('_', ' ')}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4 ml-4">
                                <Link to="/login" className="hover:text-white text-gray-300">Login</Link>
                                <Link to="/register" className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
