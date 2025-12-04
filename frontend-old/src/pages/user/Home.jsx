import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Activity, Users, X } from 'lucide-react';
import useAuthStore from '../../stores/useAuthStore';

const Home = () => {
    const { isAuthenticated } = useAuthStore();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated]);

    return (
        <div className="text-center py-12 relative">
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl animate-fade-in-up">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                        <div className="text-center">
                            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Welcome to ResQ Connect</h2>
                            <p className="text-gray-600 mb-6">
                                Join our safety network to report emergencies and get real-time help.
                            </p>
                            <div className="space-y-3">
                                <Link
                                    to="/login"
                                    className="block w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="block w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Create Account
                                </Link>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h1 className="text-5xl font-bold text-slate-800 mb-6">ResQ Connect</h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                Advanced Emergency Response System. Report incidents, get real-time help, and stay safe.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Instant SOS</h3>
                    <p className="text-gray-500">One-click reporting with Photo, Audio, and Location.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <Activity className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Real-time Response</h3>
                    <p className="text-gray-500">Connected directly to City and State authorities.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Community News</h3>
                    <p className="text-gray-500">Stay informed about safety incidents in your area.</p>
                </div>
            </div>

            <Link
                to="/report"
                className="bg-red-600 text-white px-10 py-4 rounded-full text-2xl font-bold hover:bg-red-700 shadow-lg transition-transform hover:scale-105"
            >
                REPORT EMERGENCY
            </Link>
        </div>
    );
};

export default Home;
