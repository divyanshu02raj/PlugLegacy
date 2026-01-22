require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const socketManager = require('./sockets/socketManager');

const app = express();
const server = http.createServer(app);

// Connectivity
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:8080",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Database Connection
connectDB();

// Socket.io Logic
socketManager(io);

// Basic Route
app.get('/', (req, res) => {
    res.send('PlugLegacy Backend is Running ⚡');
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});
