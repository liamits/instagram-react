const Post = require('../models/Post');

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

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.includes(req.user.id);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
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
    
    const updatedPost = await Post.findById(req.params.id)
      .populate('user', 'username avatar fullName')
      .populate('comments.user', 'username avatar');
    
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment' });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  addComment
};
