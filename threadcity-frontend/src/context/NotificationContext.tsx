import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_API_URL); // Ensure to set VITE_API_URL in your .env file
        setSocket(newSocket);

        newSocket.on('new_notification', (notification) => {
            setNotifications((prev) => [...prev, notification]);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, clearNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    return useContext(NotificationContext);
};