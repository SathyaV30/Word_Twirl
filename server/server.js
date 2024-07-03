const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {};

app.use(express.json());

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Store the socket ID for the user
  socket.on('registerUser', ({ userId, username }) => {
    users[userId] = { socketId: socket.id, username };
    console.log('Registered user:', userId, username, socket.id);
  });

  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);
    socket.to(room).emit('message', { user: 'admin', text: `${username} has joined the room.` });
  });

  socket.on('gameRequest', ({ opponentId, room, requester }) => {
    console.log(`Game request from ${requester} to ${opponentId} for room ${room}`);
    const opponentSocketId = users[opponentId]?.socketId;
    if (opponentSocketId) {
      io.to(opponentSocketId).emit('gameRequest', { room, requester });
    } else {
      console.log('Opponent not found or not connected');
    }
  });

  socket.on('acceptGame', ({ room }) => {
    socket.join(room);
    io.to(room).emit('gameAccepted', { room });
    console.log(`User joined room: ${room}`);
  });

  socket.on('declineGame', ({ room }) => {
    console.log(`Game request declined for room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove the user from the users object
    for (const userId in users) {
      if (users[userId].socketId === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
