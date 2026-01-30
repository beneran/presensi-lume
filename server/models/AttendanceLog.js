import mongoose from 'mongoose';

const attendanceLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  selfieUrl: {
    type: String,
    default: ''
  },
  selfieData: {
    type: String, // Base64 encoded image data
    default: ''
  },
  deviceFingerprint: {
    type: String,
    default: ''
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one check-in per user per session
attendanceLogSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
attendanceLogSchema.index({ sessionId: 1 });

export default mongoose.model('AttendanceLog', attendanceLogSchema);
