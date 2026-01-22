const express = require('express');
const router = express.Router();
const {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    getFriendRequests
} = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

router.post('/request/:id', protect, sendFriendRequest);
router.post('/accept/:id', protect, acceptFriendRequest);
router.post('/reject/:id', protect, rejectFriendRequest);

router.get('/', protect, getFriends);
router.get('/requests', protect, getFriendRequests);

module.exports = router;
