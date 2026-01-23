import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { authService } from '../services/api';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Init socket
        const newSocket = io('http://localhost:5000'); // Check env var in prod
        setSocket(newSocket);

        // Connection Handler (handles initial connect + reconnects)
        const handleConnect = () => {
            console.log("Socket connected/reconnected");
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                console.log("Registering user:", currentUser._id);
                newSocket.emit('register_user', currentUser._id);
            }
        };

        newSocket.on('connect', handleConnect);

        // Auth Listener
        const checkAuth = () => {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            // If socket is already connected but we just logged in
            if (currentUser && newSocket.connected) {
                newSocket.emit('register_user', currentUser._id);
            }
        };

        checkAuth(); // Initial check
        window.addEventListener('storage', checkAuth); // Listen for login/logout

        return () => {
            newSocket.disconnect();
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    // Re-register if user changes manually (login flow)
    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser && socket) {
            socket.emit('register_user', currentUser._id);
        }
    }, [socket]); // Add dependency on user login event if possible, but this covers mount

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
