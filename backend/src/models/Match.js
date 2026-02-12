const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        enum: ['chess', 'sudoku', 'wordle', '2048', 'tic-tac-toe', 'snake', 'tetris', 'logic-grid', 'crossword', 'typing-race'] // Add other games as needed
    },
    players: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Optional for guest/computer
        },
        username: String, // Fallback for Guests/AI
        avatar: String,
        score: Number,
        result: {
            type: String,
            enum: ['win', 'loss', 'draw', 'abandoned', 'completed'],
            required: true
        },
        color: String // For Chess (w/b)
    }],
    winnerId: {
        type: String, // Can be ObjectId or "computer"
        required: false
    },
    moves: {
        type: String, // PGN for chess, or JSON string for others
        required: false
    },
    duration: {
        type: Number, // In seconds
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Match', matchSchema);
