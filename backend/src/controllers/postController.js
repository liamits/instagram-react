const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getReceiverSocketId } = require('../socket/socket');

const createPost = async (req, res) => {
  try {
    const { image, caption, location } = req.body;
    
    const newPost = new Post({
      user: req.user.id,
      image,
      caption,
      location
    });

    const savedPost = await newPost.save();
    await savedPost.populate('user', 'username avatar fullName');
    
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: 'Error creating post' });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username avatar fullName')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

const getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const followingIds = [...user.following, user._id];

    const posts = await Post.find({ user: { $in: followingIds } })
      .populate('user', 'username avatar fullName')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching feed' });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.includes(req.user.id);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
      
      // Save + emit notification
      if (post.user.toString() !== req.user.id) {
        const notif = await Notification.create({
          recipient: post.user,
          sender: req.user.id,
          type: 'like',
          post: post._id,
        });
        const io = req.app.get('io');
        const receiverSocketId = getReceiverSocketId(post.user.toString());
        if (receiverSocketId) {
          const populated = await notif.populate('sender', 'username avatar');
          io.to(receiverSocketId).emit('newNotification', populated);
        }
      }
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error toggling like' });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user.id, text });
    await post.save();
    
    // Save + emit notification
    if (post.user.toString() !== req.user.id) {
      const notif = await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        type: 'comment',
        post: post._id,
        text: text.substring(0, 50),
      });
      const io = req.app.get('io');
      const receiverSocketId = getReceiverSocketId(post.user.toString());
      if (receiverSocketId) {
        const populated = await notif.populate('sender', 'username avatar');
        io.to(receiverSocketId).emit('newNotification', populated);
      }
    }

    const updatedPost = await Post.findById(req.params.id)
      .populate('user', 'username avatar fullName')
      .populate('comments.user', 'username avatar');
    
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });

    post.comments.pull(commentId);
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getFeed,
  likePost,
  addComment,
  deletePost,
  deleteComment
};
