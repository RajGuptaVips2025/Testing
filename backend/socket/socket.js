const { Server } = require("socket.io");
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const userSocketMap = {};  // Maps userId to socketId
const groupRoomMap = {};   // Maps groupId to list of userIds (or just track membership in DB)

const getReciverSocketId = (receiverId) => userSocketMap[receiverId];

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit online users to all clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // User joins a group chat (groupRoom is like the group's unique ID)
  socket.on('joinGroup', ({ groupId }) => {
    socket.join(groupId);  // Join the group room
  });

  // Handle group message sending
  socket.on('sendGroupMessage', ({ groupId, senderId, message }) => {
    io.to(groupId).emit('receiveGroupMessage', { senderId, message, groupId });
  });

  // Handle WebRTC signaling data
  socket.on('videoCallOffer', ({ to, offer }) => {
    const receiverSocketId = getReciverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('videoCallOffer', { from: userId, offer });
    }
  });

  socket.on('videoCallAnswer', ({ to, answer }) => {
    const receiverSocketId = getReciverSocketId(to);
    // console.log(receiverSocketId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('videoCallAnswer', { from: userId, answer });
    }
  });

  socket.on('iceCandidate', ({ to, candidate }) => {
    const receiverSocketId = getReciverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('iceCandidate', { from: userId, candidate });
    }
  });

  socket.on('endCall', ({ to, from }) => {
    const targetSocketId = getReciverSocketId(to);
    if (targetSocketId) {
      // Emit the endCall event to the other user
      io.to(targetSocketId).emit('endCall', { from });
    }
  });




  // Handle user disconnection
  socket.on('disconnect', () => {
    if (userId && userSocketMap[userId] === socket.id) {  // Only delete if the disconnected socket matches
      delete userSocketMap[userId];
    }
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

module.exports = { app, server, io, getReciverSocketId };
