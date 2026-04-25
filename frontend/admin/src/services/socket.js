import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:7003'; // Backend URL

export const socket = io(URL, {
    autoConnect: false
});
