import { io } from 'socket.io-client';

const URL = 'http://45.137.194.145:7003'; // Backend URL

export const socket = io(URL, {
    autoConnect: false
});
