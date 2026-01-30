import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  assessorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  scores: {
    comprehension: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    participation: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    },
    creativity: {
      type: Number,
      min: 0,
      max: 10,
      default: 5
    }
  },
  totalScore: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  criterias: {
    type: mongoose.Schema.Types.Mixed, // Flexible grading rubrics
    default: {}
  },
  completed: {
    type: Boolean,
    default: false
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

// Calculate total score before saving
assessmentSchema.pre('save', function(next) {
  if (this.scores) {
    this.totalScore = (this.scores.comprehension || 0) + 
                      (this.scores.participation || 0) + 
                      (this.scores.creativity || 0);
  }
  next();
});

// Compound index to ensure one assessment per assessor-participant-session
assessmentSchema.index({ assessorId: 1, participantId: 1, sessionId: 1 }, { unique: true });
assessmentSchema.index({ sessionId: 1 });
assessmentSchema.index({ participantId: 1 });

export default mongoose.model('Assessment', assessmentSchema);
