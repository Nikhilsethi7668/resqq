import { io } from 'socket.io-client';

const URL = 'http://45.137.194.145:5001'; // Backend URL

export const socket = io(URL, {
    autoConnect: false
});
