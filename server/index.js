import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import participantsRouter from './routes/participants.js';
import sessionsRouter from './routes/sessions.js';
import attendanceRouter from './routes/attendance.js';
import assessmentsRouter from './routes/assessments.js';
import seedRouter from './routes/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@148.230.101.65:27017/ticketing?authSource=admin';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

// Routes
app.use('/api/participants', participantsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/seed', seedRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
