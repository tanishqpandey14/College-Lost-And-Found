const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed Origins for CORS (Supports Vercel production, custom domains, and local dev)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean); // Removes undefined values if CLIENT_URL is not set

// Enable CORS for Express
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      // Check if origin matches or if it's any Vercel deployment preview (*.vercel.app)
      const isVercel = origin.endsWith('.vercel.app');
      if (allowedOrigins.includes(origin) || isVercel) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// Root Welcome Route (Fixes "Cannot GET /" on Render)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College Lost & Found API is up and running!'
  });
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isVercel = origin.endsWith('.vercel.app');
      if (allowedOrigins.includes(origin) || isVercel) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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