const express = require('express');
const { sendMessage, getMessages, getConversations, markSeen } = require('../controllers/messageController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const v = require('../modules/message/message.validation');

const router = express.Router();

router.get('/conversations', auth, getConversations);
router.get('/:id', auth, getMessages);
router.post('/send/:id', auth, validate(v.sendMessage), sendMessage);
router.put('/:id/seen', auth, markSeen);

module.exports = router;
