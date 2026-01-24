const express = require('express');
const router = express.Router();
const { getUserProfile, getUserById, updateUserProfile, getAllUsers, saveMatchResult } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/matches', protect, saveMatchResult); // Add this line
router.get('/:id', getUserById);

module.exports = router;
