const express = require('express');
const router = express.Router();
const { createPost, getPosts, getFeed, likePost, addComment, deletePost, deleteComment } = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createPost);
router.get('/', getPosts);
router.get('/feed', auth, getFeed);
router.put('/:id/like', auth, likePost);
router.post('/:id/comment', auth, addComment);
router.delete('/:id', auth, deletePost);
router.delete('/:id/comment/:commentId', auth, deleteComment);

module.exports = router;
