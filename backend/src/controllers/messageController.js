const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getReceiverSocketId } = require('../socket/socket');
const catchAsync = require('../common/catchAsync');
const ApiError = require('../common/ApiError');
const { sendResponse } = require('../common/response');

const sendMessage = catchAsync(async (req, res) => {
  const { message, postId, type = 'text', mediaUrl } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user.id;

  let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });
  if (!conversation) {
    conversation = await Conversation.create({ participants: [senderId, receiverId] });
  }

  const newMessage = new Message({ senderId, receiverId, message, postId, type, mediaUrl });
  conversation.messages.push(newMessage._id);
  await Promise.all([conversation.save(), newMessage.save()]);

  if (type === 'post') {
    await newMessage.populate('postId', 'images caption');
  }

  const socketId = getReceiverSocketId(receiverId);
  if (socketId) {
    const io = req.app.get('io');
    io.to(socketId).emit('newMessage', {
      _id: newMessage._id,
      senderId: newMessage.senderId.toString(),
      receiverId: newMessage.receiverId.toString(),
      message: newMessage.message,
      type: newMessage.type,
      mediaUrl: newMessage.mediaUrl,
      postId: newMessage.postId,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
    });
  }

  sendResponse(res, 201, newMessage);
});

const getMessages = catchAsync(async (req, res) => {
  const { id: userToChatId } = req.params;
  const senderId = req.user.id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, userToChatId] },
  }).populate({
    path: 'messages',
    populate: { path: 'postId', select: 'images caption user', populate: { path: 'user', select: 'username avatar' } }
  });

  sendResponse(res, 200, conversation ? conversation.messages : []);
});

const getConversations = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const conversations = await Conversation.find({ participants: { $in: [userId] } })
    .populate('participants', 'username avatar fullName');

  const data = conversations.map(conv => ({
    ...conv._doc,
    otherParticipant: conv.participants.find(p => p._id.toString() !== userId),
  }));

  sendResponse(res, 200, data);
});

const markSeen = catchAsync(async (req, res) => {
  const { id: otherUserId } = req.params;
  const userId = req.user.id;

  // Mark all messages from otherUser as seen by current user
  await Message.updateMany(
    { senderId: otherUserId, receiverId: userId, seenBy: { $ne: userId } },
    { $addToSet: { seenBy: userId } }
  );

  // Notify sender via socket that their messages were seen
  const io = req.app.get('io');
  const senderSocketId = getReceiverSocketId(otherUserId);
  if (senderSocketId) {
    io.to(senderSocketId).emit('messagesSeen', { by: userId, conversationWith: userId });
  }

  sendResponse(res, 200, null, 'Seen');
});

const reactMessage = catchAsync(async (req, res) => {
  const { emoji } = req.body;
  const { id: messageId } = req.params;
  const userId = req.user.id;

  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');

  const existing = message.reactions.find(r => r.user.toString() === userId);
  if (existing) {
    if (existing.emoji === emoji) {
      // toggle off
      message.reactions = message.reactions.filter(r => r.user.toString() !== userId);
    } else {
      existing.emoji = emoji;
    }
  } else {
    message.reactions.push({ user: userId, emoji });
  }
  await message.save();

  // Notify the other user via socket
  const otherId = message.senderId.toString() === userId
    ? message.receiverId.toString()
    : message.senderId.toString();
  const socketId = getReceiverSocketId(otherId);
  if (socketId) {
    const io = req.app.get('io');
    io.to(socketId).emit('messageReaction', { messageId, reactions: message.reactions });
  }

  sendResponse(res, 200, message.reactions);
});

module.exports = { sendMessage, getMessages, getConversations, markSeen, reactMessage };
