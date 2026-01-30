import express from 'express';
import AttendanceLog from '../models/AttendanceLog.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

const router = express.Router();

// Get attendance for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const attendanceLogs = await AttendanceLog.find({ sessionId })
      .populate('userId', 'name nrk avatarUrl')
      .sort({ checkInTime: -1 })
      .lean();

    const formatted = attendanceLogs.map(log => ({
      id: log._id.toString(),
      participantId: log.userId._id.toString(),
      participantName: log.userId.name,
      participantNrk: log.userId.nrk,
      avatarUrl: log.userId.avatarUrl,
      sessionId: log.sessionId.toString(),
      checkInTime: log.checkInTime,
      selfieUrl: log.selfieUrl
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get attendance stats for a session
router.get('/stats/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const totalParticipants = await User.countDocuments({ role: 'participant' });
    const presentCount = await AttendanceLog.countDocuments({ sessionId });
    const absentCount = totalParticipants - presentCount;
    const rate = totalParticipants > 0 ? Math.round((presentCount / totalParticipants) * 100) : 0;

    res.json({
      total: totalParticipants,
      present: presentCount,
      absent: absentCount,
      rate
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ error: 'Failed to fetch attendance stats' });
  }
});

// Check-in a participant
router.post('/check-in', async (req, res) => {
  try {
    const { userId, sessionId, selfieData, deviceFingerprint, location } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Verify session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if already checked in
    const existingLog = await AttendanceLog.findOne({ userId, sessionId });
    if (existingLog) {
      return res.status(400).json({ 
        error: 'Already checked in',
        checkInTime: existingLog.checkInTime
      });
    }

    // Create attendance log
    const attendanceLog = new AttendanceLog({
      userId,
      sessionId,
      checkInTime: new Date(),
      selfieData: selfieData || '',
      deviceFingerprint: deviceFingerprint || '',
      location: location || {}
    });

    await attendanceLog.save();

    res.status(201).json({
      success: true,
      message: `Welcome, ${user.name}. You are checked in.`,
      checkInTime: attendanceLog.checkInTime,
      participant: {
        id: user._id.toString(),
        name: user.name,
        nrk: user.nrk
      }
    });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Get check-in status for a participant
router.get('/status/:userId/:sessionId', async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    const attendance = await AttendanceLog.findOne({ userId, sessionId });

    res.json({
      isCheckedIn: !!attendance,
      checkInTime: attendance?.checkInTime || null
    });
  } catch (error) {
    console.error('Error fetching check-in status:', error);
    res.status(500).json({ error: 'Failed to fetch check-in status' });
  }
});

// Remove check-in (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const attendance = await AttendanceLog.findByIdAndDelete(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance log not found' });
    }

    res.json({ message: 'Check-in removed successfully' });
  } catch (error) {
    console.error('Error removing check-in:', error);
    res.status(500).json({ error: 'Failed to remove check-in' });
  }
});

export default router;
