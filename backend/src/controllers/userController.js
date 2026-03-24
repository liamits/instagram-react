const User = require('../models/User');
const Post = require('../models/Post');

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
    
    res.json({
      user,
      posts,
      postCount: posts.length,
      followersCount: user.followers.length,
      followingCount: user.following.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error following/unfollowing user' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } }
      ]
    })
    .select('username fullName avatar')
    .limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error searching users' });
  }
};

module.exports = {
  getUserProfile,
  followUnfollowUser,
  searchUsers
};
