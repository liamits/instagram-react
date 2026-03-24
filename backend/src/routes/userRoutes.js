const express = require('express');
const router = express.Router();
const { getUserProfile, followUnfollowUser } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/profile/:username', getUserProfile);
router.put('/follow/:id', auth, followUnfollowUser);

module.exports = router;
