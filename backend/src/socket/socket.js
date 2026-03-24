const { Server } = require('socket.io');
const http = require('http');

const userSocketMap = {}; // { userId: socketId }

const initSocket = (app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT"]
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId !== "undefined") userSocketMap[userId] = socket.id;

    // Emit online users
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
      delete userSocketMap[userId];
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
  });

  return { server, io };
};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

module.exports = { initSocket, getReceiverSocketId };
