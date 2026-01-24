const User = require('../models/User');
const Match = require('../models/Match');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Fetch recent games
            const matches = await Match.find({
                'players.userId': user._id
            })
                .sort({ timestamp: -1 })
                .limit(10);

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                elo: user.elo,
                wins: user.wins,
                losses: user.losses,
                joinDate: user.createdAt,
                friends: user.friends,
                friendRequests: user.friendRequests,
                sentFriendRequests: user.sentFriendRequests,
                // Calculated fields
                gamesPlayed: user.wins + user.losses,
                level: Math.floor(user.wins / 10) + 1, // Simple level logic
                title: user.elo > 2000 ? "Grandmaster" : user.elo > 1500 ? "Master" : "Rising Star",
                matches // Return recent history
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... existing getUserById ...
// @desc    Get user by ID (Public Profile)
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -email');

        if (user) {
            // Fetch recent games
            const matches = await Match.find({
                'players.userId': user._id
            })
                .sort({ timestamp: -1 })
                .limit(10);

            res.json({
                username: user.username,
                avatar: user.avatar,
                elo: user.elo,
                wins: user.wins,
                losses: user.losses,
                joinDate: user.createdAt,
                // Calculated fields
                gamesPlayed: user.wins + user.losses,
                level: Math.floor(user.wins / 10) + 1,
                title: user.elo > 2000 ? "Grandmaster" : user.elo > 1500 ? "Master" : "Rising Star",
                matches
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... existing updateUserProfile ...
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            if (req.body.username && req.body.username !== user.username) {
                const userExists = await User.findOne({
                    username: req.body.username,
                    _id: { $ne: req.user._id }
                });
                if (userExists) {
                    return res.status(400).json({ message: 'Username already taken' });
                }
                user.username = req.body.username;
            }

            if (req.body.email && req.body.email !== user.email) {
                const emailExists = await User.findOne({
                    email: req.body.email,
                    _id: { $ne: req.user._id }
                });
                if (emailExists) {
                    return res.status(400).json({ message: 'Email already taken' });
                }
                user.email = req.body.email;
            }

            user.avatar = req.body.avatar || user.avatar;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                elo: updatedUser.elo,
                wins: updatedUser.wins,
                losses: updatedUser.losses,
                joinDate: updatedUser.createdAt,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (for search)
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password -email -friends -friendRequests -sentFriendRequests');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Save match result
// @route   POST /api/users/matches
// @access  Private
const saveMatchResult = async (req, res) => {
    try {
        const { gameId, result, opponent, score, moves, playerColor, duration } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update User Stats
        if (result === 'win') {
            user.wins += 1;
            user.elo += 10;
        } else if (result === 'loss') {
            user.losses += 1;
            user.elo = Math.max(0, user.elo - 10);
        } else if (result === 'draw') {
            // Optional: small adjustment or no change
        }

        await user.save();

        // Construct player objects
        const playerOne = {
            userId: user._id,
            username: user.username,
            avatar: user.avatar,
            result: result,
            score: score || 0,
            color: playerColor || 'w'
        };

        const opponentResult = result === 'win' ? 'loss' : (result === 'loss' ? 'win' : 'draw');
        const playerTwo = {
            userId: opponent?.id || null, // If we have an ID for a real user
            username: opponent?.username || "Opponent",
            avatar: opponent?.avatar,
            score: opponent?.score || 0,
            result: opponentResult,
            color: playerColor === 'w' ? 'b' : 'w'
        };

        // Save Match Record
        const match = await Match.create({
            gameId: gameId || 'chess',
            players: [playerOne, playerTwo],
            winnerId: result === 'win' ? user._id : (result === 'loss' ? (opponent?.id || "opponent") : null),
            moves: moves || "",
            duration: duration || 0,
            timestamp: new Date()
        });

        res.status(201).json(match);
    } catch (error) {
        console.error("Error saving match:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProfile,
    getUserById,
    updateUserProfile,
    getAllUsers,
    saveMatchResult
};
