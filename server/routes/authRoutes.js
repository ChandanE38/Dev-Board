const express = require('express');
const { getMe, loginUser, registerUser, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);

module.exports = router;