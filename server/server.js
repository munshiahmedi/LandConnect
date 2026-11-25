
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { AccessToken } = require('livekit-server-sdk');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Uploaded property images
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Routes
const authRoutes = require('./routes/authRoutes');
const landRoutes = require('./routes/landRoutes');
const messageRoutes = require('./routes/messageRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/lands', landRoutes);
app.use('/api/messages', messageRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'LandConnect Backend is running!'
  });
});

// LiveKit token generation
app.post('/api/calls/token', async (req, res) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({
        error: 'roomName and participantName are required'
      });
    }

    const accessToken = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
        ttl: '1h'
      }
    );

    accessToken.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true
    });

    const token = await accessToken.toJwt();

    res.json({
      token,
      serverUrl: process.env.LIVEKIT_URL
    });

  } catch (error) {
    console.error('Token generation error:', error);

    res.status(500).json({
      error: 'Unable to generate access token'
    });
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Register user
  socket.on('register-user', (userId) => {
    if (!userId) return;

    socket.join(`user-${userId}`);

    console.log(`User ${userId} registered`);
  });

  // Initiate call
  socket.on('call-user', (data) => {
    const {
      receiverId,
      callerName,
      roomName,
      callType
    } = data;

    if (!receiverId || !roomName || !callType) return;

    io.to(`user-${receiverId}`).emit('incoming-call', {
      callerId: data.callerId,
      callerName,
      roomName,
      callType
    });
  });

  // Accept call
  socket.on('accept-call', (data) => {
    if (!data?.callerId || !data?.roomName) return;

    io.to(`user-${data.callerId}`).emit('call-accepted', {
      roomName: data.roomName
    });
  });

  // Reject call
  socket.on('reject-call', (data) => {
    if (!data?.callerId) return;

    io.to(`user-${data.callerId}`).emit('call-rejected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`LandConnect backend running on port ${PORT}`);
});
