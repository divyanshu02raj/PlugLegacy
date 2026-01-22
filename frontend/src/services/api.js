import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the Token in headers
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const authService = {
    signup: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },
    login: async (userData) => {
        const response = await api.post('/auth/login', userData);
        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    }
};

export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put('/users/profile', data);
        if (response.data) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...currentUser, ...response.data };
            console.log("Updating local storage user:", updatedUser); // DEBUG
            localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage
            console.log("Dispatching user-update event"); // DEBUG
            window.dispatchEvent(new Event('user-update')); // Dispatch event
        }
        return response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    }
};

export const friendService = {
    sendRequest: async (userId) => {
        const response = await api.post(`/friends/request/${userId}`);
        window.dispatchEvent(new Event('friend-update'));
        return response.data;
    },
    acceptRequest: async (requesterId) => {
        const response = await api.post(`/friends/accept/${requesterId}`);
        window.dispatchEvent(new Event('friend-update'));
        return response.data;
    },
    rejectRequest: async (requesterId) => {
        const response = await api.post(`/friends/reject/${requesterId}`);
        window.dispatchEvent(new Event('friend-update'));
        return response.data;
    },
    getFriends: async () => {
        const response = await api.get('/friends');
        return response.data;
    },
    getRequests: async () => {
        const response = await api.get('/friends/requests');
        return response.data;
    },
    getSentRequests: async () => {
        const response = await api.get('/friends/sent-requests');
        return response.data;
    },
    removeFriend: async (friendId) => {
        const response = await api.post(`/friends/remove/${friendId}`);
        window.dispatchEvent(new Event('friend-update'));
        return response.data;
    }
};

export default api;
