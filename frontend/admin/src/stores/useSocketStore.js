import { create } from 'zustand';
import { io } from 'socket.io-client';
import useAuthStore from './useAuthStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const useSocketStore = create((set, get) => ({
    socket: null,
    isConnected: false,
    isBlinking: false,
    blinkMessage: '',
    blinkType: 'alert', // 'alert' or 'broadcast'

    connect: () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Socket connected');
            set({ isConnected: true });

            // Join rooms based on role
            socket.emit('join_room', {
                role: user.role,
                city: user.city,
                state: user.state
            });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ isConnected: false });
        });

        socket.on('new_alert', (data) => {
            console.log('New Alert:', data);
            set({
                isBlinking: true,
                blinkMessage: `NEW SOS: ${data.city}, ${data.state} - Danger Level: ${data.dangerLevel}`,
                blinkType: 'alert'
            });
            // Play sound if possible
            const audio = new Audio('/alert.mp3'); // Ensure this file exists or use a base64
            audio.play().catch(e => console.log('Audio play failed', e));
        });

        socket.on('broadcast_msg', (data) => {
            console.log('Broadcast:', data);
            set({
                isBlinking: true,
                blinkMessage: `BROADCAST from ${data.from}: ${data.message}`,
                blinkType: 'broadcast'
            });
        });

        set({ socket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    },

    stopBlinking: () => {
        set({ isBlinking: false, blinkMessage: '' });
    }
}));

export default useSocketStore;
