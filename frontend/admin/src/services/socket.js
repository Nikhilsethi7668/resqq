import { io } from 'socket.io-client';

const URL = 'http://localhost:7000'; // Backend URL

export const socket = io(URL, {
    autoConnect: false
});
