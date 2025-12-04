import { io } from 'socket.io-client';

const URL = 'http://localhost:5001'; // Backend URL

export const socket = io(URL, {
    autoConnect: false
});
