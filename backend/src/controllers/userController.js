const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                elo: user.elo,
                wins: user.wins,
                losses: user.losses,
                joinDate: user.createdAt,
                // Calculated fields
                gamesPlayed: user.wins + user.losses,
                level: Math.floor(user.wins / 10) + 1, // Simple level logic
                title: user.elo > 2000 ? "Grandmaster" : user.elo > 1500 ? "Master" : "Rising Star"
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID (Public Profile)
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -email');

        if (user) {
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
                title: user.elo > 2000 ? "Grandmaster" : user.elo > 1500 ? "Master" : "Rising Star"
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
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

module.exports = {
    getUserProfile,
    getUserById,
    updateUserProfile
};
