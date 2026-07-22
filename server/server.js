const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Attach Socket.IO instance to app & requests
app.set('socketio', io);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO Real-time Connection Setup
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client Connected: ${socket.id}`);

  socket.on('join_room', (roomId) => {
    if (roomId) {
      socket.join(roomId.toString());
      console.log(`[Socket.IO] User ${socket.id} joined room: ${roomId}`);
    }
  });

  socket.on('leave_room', (roomId) => {
    if (roomId) {
      socket.leave(roomId.toString());
      console.log(`[Socket.IO] User ${socket.id} left room: ${roomId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client Disconnected: ${socket.id}`);
  });
});

// API Routes Registration
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/lost-items', require('./routes/lostItem.routes'));
app.use('/api/found-items', require('./routes/foundItem.routes'));
app.use('/api/claims', require('./routes/claim.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/meetings', require('./routes/meeting.routes'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
});