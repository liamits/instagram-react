const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getReceiverSocketId } = require('../socket/socket');
const catchAsync = require('../common/utils/catchAsync');
const ApiError = require('../common/utils/ApiError');
const { sendResponse } = require('../common/utils/response');

const sendMessage = catchAsync(async (req, res) => {
  const { message } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user.id;

  let conversation = await Conversation.findOne({ participants: { $all: [senderId, receiverId] } });
  if (!conversation) {
    conversation = await Conversation.create({ participants: [senderId, receiverId] });
  }

  const newMessage = new Message({ senderId, receiverId, message });
  conversation.messages.push(newMessage._id);
  await Promise.all([conversation.save(), newMessage.save()]);

  const socketId = getReceiverSocketId(receiverId);
  if (socketId) {
    const io = req.app.get('io');
    io.to(socketId).emit('newMessage', {
      _id: newMessage._id,
      senderId: newMessage.senderId.toString(),
      receiverId: newMessage.receiverId.toString(),
      message: newMessage.message,
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
  }).populate('messages');

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

module.exports = { sendMessage, getMessages, getConversations };
