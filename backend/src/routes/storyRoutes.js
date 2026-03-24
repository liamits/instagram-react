const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createStory, getStories, viewStory, getViewers, deleteStory } = require('../controllers/storyController');

router.post('/', auth, createStory);
router.get('/', auth, getStories);
router.put('/:id/view', auth, viewStory);
router.get('/:id/viewers', auth, getViewers);
router.delete('/:id', auth, deleteStory);

module.exports = router;
