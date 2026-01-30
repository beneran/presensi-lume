import express from 'express';
import Assessment from '../models/Assessment.js';
import User from '../models/User.js';

const router = express.Router();

// Get assessments for a session
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { assessorId } = req.query;

    const query = { sessionId };
    if (assessorId) {
      query.assessorId = assessorId;
    }

    const assessments = await Assessment.find(query)
      .populate('participantId', 'name nrk avatarUrl')
      .populate('assessorId', 'name')
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = assessments.map(a => ({
      id: a._id.toString(),
      assessorId: a.assessorId._id.toString(),
      assessorName: a.assessorId.name,
      participantId: a.participantId._id.toString(),
      participantName: a.participantId.name,
      participantNrk: a.participantId.nrk,
      participantAvatar: a.participantId.avatarUrl,
      sessionId: a.sessionId.toString(),
      scores: a.scores,
      totalScore: a.totalScore,
      notes: a.notes,
      completed: a.completed,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Get assessment progress for a session
router.get('/progress/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { assessorId } = req.query;

    const query = { sessionId, completed: true };
    if (assessorId) {
      query.assessorId = assessorId;
    }

    const completedCount = await Assessment.countDocuments(query);
    const totalParticipants = await User.countDocuments({ role: 'participant' });
    const percentage = totalParticipants > 0 ? Math.round((completedCount / totalParticipants) * 100) : 0;

    res.json({
      completed: completedCount,
      total: totalParticipants,
      percentage
    });
  } catch (error) {
    console.error('Error fetching assessment progress:', error);
    res.status(500).json({ error: 'Failed to fetch assessment progress' });
  }
});

// Get or create assessment for a specific participant
router.get('/:sessionId/:participantId', async (req, res) => {
  try {
    const { sessionId, participantId } = req.params;
    const { assessorId } = req.query;

    if (!assessorId) {
      return res.status(400).json({ error: 'Assessor ID is required' });
    }

    let assessment = await Assessment.findOne({
      sessionId,
      participantId,
      assessorId
    }).lean();

    if (!assessment) {
      // Return default values if no assessment exists
      return res.json({
        id: null,
        sessionId,
        participantId,
        assessorId,
        scores: {
          comprehension: 5,
          participation: 5,
          creativity: 5
        },
        totalScore: 15,
        notes: '',
        completed: false
      });
    }

    res.json({
      id: assessment._id.toString(),
      sessionId: assessment.sessionId.toString(),
      participantId: assessment.participantId.toString(),
      assessorId: assessment.assessorId.toString(),
      scores: assessment.scores,
      totalScore: assessment.totalScore,
      notes: assessment.notes,
      completed: assessment.completed
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Create or update assessment
router.post('/', async (req, res) => {
  try {
    const { assessorId, participantId, sessionId, scores, notes, completed } = req.body;

    // Validate required fields
    if (!assessorId || !participantId || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find existing or create new
    let assessment = await Assessment.findOne({ assessorId, participantId, sessionId });

    if (assessment) {
      // Update existing
      assessment.scores = scores || assessment.scores;
      assessment.notes = notes !== undefined ? notes : assessment.notes;
      assessment.completed = completed !== undefined ? completed : assessment.completed;
      assessment.updatedAt = new Date();
    } else {
      // Create new
      assessment = new Assessment({
        assessorId,
        participantId,
        sessionId,
        scores: scores || { comprehension: 5, participation: 5, creativity: 5 },
        notes: notes || '',
        completed: completed || false
      });
    }

    await assessment.save();

    res.status(assessment.isNew ? 201 : 200).json({
      id: assessment._id.toString(),
      assessorId: assessment.assessorId.toString(),
      participantId: assessment.participantId.toString(),
      sessionId: assessment.sessionId.toString(),
      scores: assessment.scores,
      totalScore: assessment.totalScore,
      notes: assessment.notes,
      completed: assessment.completed
    });
  } catch (error) {
    console.error('Error saving assessment:', error);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

// Delete assessment
router.delete('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
});

export default router;
