const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins for testing/development
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Import Models for Seeding/Socket
const User = require('./models/User');
const Message = require('./models/Message');

// Seed Default Admin Account
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@projectpulse.com',
        password: 'admin123', // Will be hashed by User pre-save hook
        role: 'admin',
        userId: 'PP-1000'
      });
      console.log('Default Admin Account Seeded (admin@projectpulse.com / admin123)');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  }
};

// Connect to Database and seed admin
connectDB(seedAdmin);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/mentor', require('./routes/mentorRoutes'));
app.use('/api/leader', require('./routes/leaderRoutes'));
app.use('/api/member', require('./routes/memberRoutes'));
app.use('/api/common', require('./routes/commonRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('ProjectPulse API is running...');
});

// Socket.io Real-time Chat Logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join Room event (one room per team)
  socket.on('joinRoom', ({ teamId }) => {
    socket.join(teamId);
    console.log(`User socket ${socket.id} joined team room: ${teamId}`);
  });

  // Send Message event
  socket.on('sendMessage', async (data) => {
    const { teamId, senderId, text, file } = data;
    try {
      // Save message to MongoDB
      let message = await Message.create({
        team: teamId,
        sender: senderId,
        text: text || '',
        file: file || null
      });

      // Populate sender info for the frontend
      message = await message.populate('sender', 'name role userId');

      // Broadcast message to everyone in the room
      io.to(teamId).emit('newMessage', message);
    } catch (err) {
      console.error('Socket error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
