const express = require('express');
const { sendMessage, getMessages, getConversations } = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');
const validate = require('../common/middlewares/validate');
const v = require('../modules/message/message.validation');

const router = express.Router();

router.get('/conversations', auth, getConversations);
router.get('/:id', auth, getMessages);
router.post('/send/:id', auth, validate(v.sendMessage), sendMessage);

module.exports = router;
