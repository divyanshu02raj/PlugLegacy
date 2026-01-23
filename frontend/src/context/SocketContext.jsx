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

        // Auth Listener
        const checkAuth = () => {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            if (currentUser && newSocket) {
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
