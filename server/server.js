const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {};
const gameData = {};
const gameRequests = {}; 
app.use(express.json());

const PORT = process.env.PORT || 5001;

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Log the total number of connected clients
  console.log('Total clients connected:', io.engine.clientsCount);

  socket.on('registerUser', ({ userId, username }) => {
    // If the user is already connected, ignore this registration
    if (users[userId]) {
      console.log(`User ${userId} is already registered with socket ID ${users[userId].socketId}`);
      return;
    }
    
    users[userId] = { socketId: socket.id, username };
    console.log('Registered user:', userId, username, socket.id);
  });

  socket.on('joinRoom', ({ room, username }) => {
    socket.join(room);
    console.log(`${username} joined room: ${room}`);

    const roomClients = io.sockets.adapter.rooms.get(room) || new Set();
    console.log(`Current members of room ${room}:`, roomClients);
    
    socket.to(room).emit('message', { user: 'admin', text: `${username} has joined the room.` });
  });

  socket.on('gameRequest', ({ opponentId, room, requester, map, time }) => {

    console.log(`Game request from ${requester} to ${opponentId} for room ${room}`);
    const opponentSocketId = users[opponentId]?.socketId;

    if (opponentSocketId) {
      gameRequests[room] = socket.id; // Store the requester's socket ID
      io.to(opponentSocketId).emit('gameRequest', { room, requester, map, time });
      
    } else {
      console.log('Opponent not found or not connected');
    }
   
  });

  socket.on('postGameData', ({ room, foundWords }) => {
    if (!gameData[room]) {
      gameData[room] = {};
    }

    console.log('This is the room:', room);
    gameData[room][socket.id] = { foundWords };

    const roomClients = io.sockets.adapter.rooms.get(room) || new Set();

    console.log(io.sockets.adapter.rooms);
    console.log('Room clients:', roomClients);
    console.log('Game data:', gameData[room]);

    if (roomClients.size === Object.keys(gameData[room]).length) {
      const clientIds = Object.keys(gameData[room]);
      const [firstClient, secondClient] = clientIds;

      console.log(`Sending data to ${firstClient}:`, gameData[room][secondClient]);
      console.log(`Sending data to ${secondClient}:`, gameData[room][firstClient]);

      io.to(firstClient).emit('opponentPostGameData', gameData[room][secondClient]);
      io.to(secondClient).emit('opponentPostGameData', gameData[room][firstClient]);
    }
  });

  socket.on('generateLetters', ({ room, letters, selectedTime }) => {
    console.log(`Generating letters for room: ${room}, letters: ${letters}, selectedTime: ${selectedTime}`);
    io.to(room).emit('generateLetters', { room, letters, selectedTime });
  });

  socket.on('getUsersInRoom', (room, callback) => {
    const clients = io.sockets.adapter.rooms.get(room) || new Set();
    const usersInRoom = [...clients].map(clientId => {
      return Object.keys(users).find(userId => users[userId].socketId === clientId);
    });
    callback(usersInRoom.filter(Boolean)); // Filter out any undefined values
  });

  socket.on('acceptGame', ({ room }) => {
    socket.join(room);
    io.to(room).emit('gameAccepted', { room });
    console.log(`User joined room: ${room}`);
  });

  socket.on('declineGame', ({ room, guestUsername }) => {
    const requesterSocketId = gameRequests[room];
    if (requesterSocketId) {
      io.to(requesterSocketId).emit('gameRequestDeclined', { room, guestUsername });
      delete gameRequests[room]; // Clean up the stored request
    }
    console.log(`Game request declined for room: ${room}`);
  });

  socket.on('leaveRoom', ({ room, username }) => {
    socket.leave(room);
    console.log(`${username} left room: ${room}`);
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
    // Clean up game data
    for (const room in gameData) {
      if (gameData[room][socket.id]) {
        delete gameData[room][socket.id];
      }
    }

    // Clean up game requests
    for (const room in gameRequests) {
      if (gameRequests[room] === socket.id) {
        delete gameRequests[room];
      }
    }

    // Log the remaining connected clients
    console.log('Total clients connected:', io.engine.clientsCount);
  });
});



server.listen(5001, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:5001`);
});
