import { io } from 'socket.io-client';

const URL = 'http://66.94.120.78:7003'; // Backend URL

export const socket = io(URL, {
    autoConnect: false
});
