const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getNotifications, markAllRead, getUnreadCount } = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.put('/read-all', auth, markAllRead);

module.exports = router;
