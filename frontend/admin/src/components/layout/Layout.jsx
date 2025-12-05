import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import api from '../../services/api';
import Navbar from './Navbar';
import useUIStore from '../../stores/useUIStore';
import useAuthStore from '../../stores/useAuthStore';
import { socket } from '../../services/socket';

const Layout = () => {
    const { isBlinking, alertMessage, startBlinking, stopBlinking } = useUIStore();
    const { user, token } = useAuthStore();
    const [currentAlertId, setCurrentAlertId] = useState(null);

    useEffect(() => {
        if (user && !socket.connected) {
            socket.connect();

            // Join Room
            socket.emit('join_room', {
                role: user.role,
                city: user.city,
                state: user.state
            });

            // Listen for alerts
            const handleNewAlert = (data) => {
                console.log("New Alert Received:", data);
                setCurrentAlertId(data.alertId);
                startBlinking(`URGENT: ${data.message} in ${data.city}`);

                // Play sound
                const audio = new Audio('/alert.mp3');
                audio.play().catch(e => console.log("Audio play failed", e));
            };

            const handleBroadcast = (data) => {
                startBlinking(`BROADCAST from ${data.from}: ${data.message}`);
            };

            socket.on('new_alert', handleNewAlert);
            socket.on('broadcast_msg', handleBroadcast);

            return () => {
                socket.off('new_alert', handleNewAlert);
                socket.off('broadcast_msg', handleBroadcast);
                // Do not disconnect here to avoid reconnection loops if component re-renders
                // socket.disconnect(); 
            };
        }
    }, [user]); // Only re-run if user changes

    const handleAcknowledge = async () => {
        // Send acknowledgment to backend
        if (currentAlertId && token) {
            try {
                await api.post(
                    `/admin/alerts/${currentAlertId}/acknowledge`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to acknowledge alert:", err);
            }
        }

        stopBlinking();
        setCurrentAlertId(null);
    };

    return (
        <div className={`min-h-screen flex flex-col ${isBlinking ? 'animate-pulse bg-red-500' : 'bg-slate-50'}`}>
            {isBlinking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-600 bg-opacity-90 animate-pulse">
                    <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-lg">
                        <h1 className="text-4xl font-bold text-red-600 mb-4">🚨 ALERT 🚨</h1>
                        <p className="text-xl font-semibold mb-6">{alertMessage}</p>
                        <button
                            onClick={handleAcknowledge}
                            className="bg-red-600 text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-red-700 shadow-lg transition-transform hover:scale-105"
                        >
                            ACKNOWLEDGE & VIEW
                        </button>
                    </div>
                </div>
            )}

            <Navbar />
            <main className="flex-grow container mx-auto p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
