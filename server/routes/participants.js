import express from 'express';
import User from '../models/User.js';
import AttendanceLog from '../models/AttendanceLog.js';

const router = express.Router();

// Get all participants (users with role 'participant')
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    // Get all participants
    const participants = await User.find({ role: 'participant' })
      .sort({ name: 1 })
      .lean();

    if (sessionId) {
      // Get attendance logs for this session
      const attendanceLogs = await AttendanceLog.find({ sessionId })
        .lean();

      const attendanceMap = new Map(
        attendanceLogs.map(log => [log.userId.toString(), log])
      );

      // Merge participant data with attendance status
      const participantsWithStatus = participants.map(p => {
        const attendance = attendanceMap.get(p._id.toString());
        return {
          id: p._id.toString(),
          name: p.name,
          nip: p.nip,
          nrk: p.nrk,
          gol: p.gol,
          jabatan: p.jabatan,
          unitKerja: p.unitKerja,
          role: p.role,
          avatarUrl: p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&size=200`,
          status: attendance ? 'present' : 'absent',
          checkInTime: attendance?.checkInTime,
          selfieUrl: attendance?.selfieUrl
        };
      });

      return res.json(participantsWithStatus);
    }

    // Return participants without session-specific status
    const formattedParticipants = participants.map(p => ({
      id: p._id.toString(),
      name: p.name,
      nip: p.nip,
      nrk: p.nrk,
      gol: p.gol,
      jabatan: p.jabatan,
      unitKerja: p.unitKerja,
      role: p.role,
      avatarUrl: p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&size=200`,
      status: 'absent',
      checkInTime: undefined
    }));

    res.json(formattedParticipants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Search participants
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const participants = await User.find({
      role: 'participant',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { nrk: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(10)
    .lean();

    const formatted = participants.map(p => ({
      id: p._id.toString(),
      name: p.name,
      nip: p.nip,
      nrk: p.nrk,
      gol: p.gol,
      jabatan: p.jabatan,
      unitKerja: p.unitKerja,
      role: p.role,
      avatarUrl: p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&size=200`,
      status: 'absent'
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error searching participants:', error);
    res.status(500).json({ error: 'Failed to search participants' });
  }
});

// Get single participant
router.get('/:id', async (req, res) => {
  try {
    const participant = await User.findById(req.params.id).lean();
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({
      id: participant._id.toString(),
      name: participant.name,
      nip: participant.nip,
      nrk: participant.nrk,
      gol: participant.gol,
      jabatan: participant.jabatan,
      unitKerja: participant.unitKerja,
      role: participant.role,
      avatarUrl: participant.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random&size=200`
    });
  } catch (error) {
    console.error('Error fetching participant:', error);
    res.status(500).json({ error: 'Failed to fetch participant' });
  }
});

// Create participant
router.post('/', async (req, res) => {
  try {
    const { name, nrk, email, avatarUrl } = req.body;

    const existingUser = await User.findOne({ nrk });
    if (existingUser) {
      return res.status(400).json({ error: 'NRK already exists' });
    }

    const participant = new User({
      name,
      nrk,
      email,
      avatarUrl,
      role: 'participant'
    });

    await participant.save();

    res.status(201).json({
      id: participant._id.toString(),
      name: participant.name,
      nrk: participant.nrk,
      role: participant.role,
      avatarUrl: participant.avatarUrl || `https://picsum.photos/seed/${participant._id}/200/200`,
      status: 'absent'
    });
  } catch (error) {
    console.error('Error creating participant:', error);
    res.status(500).json({ error: 'Failed to create participant' });
  }
});

// Update participant
router.put('/:id', async (req, res) => {
  try {
    const { name, nrk, email, avatarUrl } = req.body;

    const participant = await User.findByIdAndUpdate(
      req.params.id,
      { name, nrk, email, avatarUrl, updatedAt: new Date() },
      { new: true }
    );

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({
      id: participant._id.toString(),
      name: participant.name,
      nrk: participant.nrk,
      role: participant.role,
      avatarUrl: participant.avatarUrl
    });
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ error: 'Failed to update participant' });
  }
});

// Delete participant
router.delete('/:id', async (req, res) => {
  try {
    const participant = await User.findByIdAndDelete(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    res.json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({ error: 'Failed to delete participant' });
  }
});

export default router;
