const User = require('../models/User');

// @desc    Send a friend request
// @route   POST /api/friends/request/:id
// @access  Private
const sendFriendRequest = async (req, res) => {
    try {
        const targetId = req.params.id;
        const senderId = req.user._id;

        if (targetId === senderId.toString()) {
            return res.status(400).json({ message: "You cannot friend yourself." });
        }

        const targetUser = await User.findById(targetId);
        const senderUser = await User.findById(senderId);

        if (!targetUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if already friends or requested
        if (targetUser.friends.includes(senderId) || targetUser.friendRequests.includes(senderId)) {
            return res.status(400).json({ message: "Request already sent or already friends." });
        }

        // Update arrays
        targetUser.friendRequests.push(senderId);
        senderUser.sentFriendRequests.push(targetId);

        await targetUser.save();
        await senderUser.save();

        res.json({ message: "Friend request sent." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept a friend request
// @route   POST /api/friends/accept/:id
// @access  Private
const acceptFriendRequest = async (req, res) => {
    try {
        const requesterId = req.params.id; // User who sent the request
        const userId = req.user._id;      // Current user accepting it

        const user = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (!user || !requester) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.friendRequests.includes(requesterId)) {
            return res.status(400).json({ message: "No friend request found." });
        }

        // Add to friends lists
        user.friends.push(requesterId);
        requester.friends.push(userId);

        // Remove from requests
        user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
        requester.sentFriendRequests = requester.sentFriendRequests.filter(id => id.toString() !== userId.toString());

        await user.save();
        await requester.save();

        res.json({ message: "Friend request accepted." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a friend request
// @route   POST /api/friends/reject/:id
// @access  Private
const rejectFriendRequest = async (req, res) => {
    try {
        const requesterId = req.params.id;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const requester = await User.findById(requesterId);

        if (user) {
            user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
            await user.save();
        }

        if (requester) {
            requester.sentFriendRequests = requester.sentFriendRequests.filter(id => id.toString() !== userId.toString());
            await requester.save();
        }

        res.json({ message: "Friend request rejected." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get list of friends
// @route   GET /api/friends
// @access  Private
const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', 'username avatar elo wins');
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests
// @access  Private
const getFriendRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friendRequests', 'username avatar elo');
        res.json(user.friendRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    getFriendRequests
};
