import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (url, options = {}) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        // Create socket connection
        socketRef.current = io(url, {
            autoConnect: true,
            ...options,
        });

        // Connection event handlers
        socketRef.current.on('connect', () => {
            setIsConnected(true);
            setError(null);
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (err) => {
            setError(err.message);
            setIsConnected(false);
        });

        setSocket(socketRef.current);

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [url]);

    const emit = (event, data) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(event, data);
        }
    };

    const on = (event, handler) => {
        if (socketRef.current) {
            socketRef.current.on(event, handler);

            // Return cleanup function
            return () => {
                if (socketRef.current) {
                    socketRef.current.off(event, handler);
                }
            };
        }
    };

    return {
        socket,
        isConnected,
        error,
        emit,
        on,
    };
};
