const Story = require('../models/Story');
const User = require('../models/User');

const createStory = async (req, res) => {
  try {
    const { image } = req.body;
    const story = await Story.create({ user: req.user.id, image });
    await story.populate('user', 'username avatar');
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ message: 'Error creating story' });
  }
};

const getStories = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const ids = [...user.following, user._id];

    const stories = await Story.find({ user: { $in: ids } })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    // Group by user
    const grouped = {};
    stories.forEach(s => {
      const uid = s.user._id.toString();
      if (!grouped[uid]) grouped[uid] = { user: s.user, stories: [] };
      grouped[uid].stories.push(s);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stories' });
  }
};

const viewStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (!story.viewers.includes(req.user.id)) {
      story.viewers.push(req.user.id);
      await story.save();
    }
    res.json({ message: 'ok' });
  } catch (err) {
    res.status(500).json({ message: 'Error viewing story' });
  }
};

const getViewers = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('viewers', 'username avatar');
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });
    res.json(story.viewers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching viewers' });
  }
};

const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Unauthorized' });
    await story.deleteOne();
    res.json({ message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting story' });
  }
};

module.exports = { createStory, getStories, viewStory, getViewers, deleteStory };
