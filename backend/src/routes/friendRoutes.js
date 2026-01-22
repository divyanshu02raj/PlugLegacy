const express = require('express');
const router = express.Router();
const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriends,
    getFriendRequests,
    getSentFriendRequests
} = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request/:id', protect, sendFriendRequest);
router.post('/accept/:id', protect, acceptFriendRequest);
router.post('/reject/:id', protect, rejectFriendRequest);
router.post('/remove/:id', protect, removeFriend);

router.get('/', protect, getFriends);
router.get('/requests', protect, getFriendRequests);
router.get('/sent-requests', protect, getSentFriendRequests);

module.exports = router;
