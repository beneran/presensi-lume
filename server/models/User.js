import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nip: {
    type: String,
    trim: true,
    default: ''
  },
  nrk: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  gol: {
    type: String,
    trim: true,
    default: ''
  },
  jabatan: {
    type: String,
    trim: true,
    default: ''
  },
  unitKerja: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'assessor', 'participant'],
    default: 'participant'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster searches
userSchema.index({ name: 'text', nrk: 'text' });
userSchema.index({ role: 1 });
userSchema.index({ unitKerja: 1 });

export default mongoose.model('User', userSchema);
