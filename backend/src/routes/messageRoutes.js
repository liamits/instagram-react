const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

router.get('/:id', auth, getMessages);
router.post('/send/:id', auth, sendMessage);

module.exports = router;
