import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';

const router = express.Router();

// Get all sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('assessorId', 'name nrk')
      .sort({ startTime: 1 })
      .lean();

    // Get total participant count
    const participantCount = await User.countDocuments({ role: 'participant' });

    const formatted = sessions.map(s => ({
      id: s._id.toString(),
      title: s.title,
      description: s.description,
      timeRange: s.timeRange,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      assessor: s.assessorId ? {
        id: s.assessorId._id.toString(),
        name: s.assessorId.name,
        nrk: s.assessorId.nrk
      } : null,
      totalParticipants: participantCount
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get single session
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('assessorId', 'name nrk')
      .lean();
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const participantCount = await User.countDocuments({ role: 'participant' });

    res.json({
      id: session._id.toString(),
      title: session.title,
      description: session.description,
      timeRange: session.timeRange,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      assessor: session.assessorId ? {
        id: session.assessorId._id.toString(),
        name: session.assessorId.name
      } : null,
      totalParticipants: participantCount
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Create session
router.post('/', async (req, res) => {
  try {
    const { title, description, timeRange, startTime, endTime, assessorId, status } = req.body;

    const session = new Session({
      title,
      description,
      timeRange,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : new Date(),
      assessorId: assessorId || null,
      status: status || 'upcoming'
    });

    await session.save();

    const participantCount = await User.countDocuments({ role: 'participant' });

    res.status(201).json({
      id: session._id.toString(),
      title: session.title,
      description: session.description,
      timeRange: session.timeRange,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      totalParticipants: participantCount
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session
router.put('/:id', async (req, res) => {
  try {
    const { title, description, timeRange, startTime, endTime, assessorId, status } = req.body;

    const updateData = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (timeRange !== undefined) updateData.timeRange = timeRange;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (assessorId !== undefined) updateData.assessorId = assessorId;
    if (status !== undefined) updateData.status = status;

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assessorId', 'name nrk');

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const participantCount = await User.countDocuments({ role: 'participant' });

    res.json({
      id: session._id.toString(),
      title: session.title,
      description: session.description,
      timeRange: session.timeRange,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
      assessor: session.assessorId ? {
        id: session.assessorId._id.toString(),
        name: session.assessorId.name
      } : null,
      totalParticipants: participantCount
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
