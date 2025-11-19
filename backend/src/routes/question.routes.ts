import { Router, Request, Response } from 'express';
import { getDB } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, optionalAuth, AuthRequest } from '../middleware/auth.middleware';
import { distance } from 'fastest-levenshtein';

const router = Router();

// Calculate similarity between two strings
function calculateSimilarity(answer: string, userAnswer: string): number {
  const a = answer.toLowerCase().trim();
  const b = userAnswer.toLowerCase().trim();

  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;

  const dist = distance(a, b);
  return ((maxLen - dist) / maxLen) * 100;
}

// Get all questions for a room
router.get('/room/:roomId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const db = getDB();

    const [questions] = await db.query(`
      SELECT id, room_id, type, order_index, title, content,
             options, correct_answer, hint, points, image_url,
             video_url, similarity_threshold
      FROM questions
      WHERE room_id = ?
      ORDER BY order_index ASC
    `, [roomId]);

    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get question by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [questions] = await db.query(
      'SELECT * FROM questions WHERE id = ?',
      [id]
    );

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    res.json({ question: questions[0] });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new question
router.post('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const {
      room_id,
      type,
      order_index,
      title,
      content,
      options,
      correct_answer,
      hint,
      points,
      image_url,
      video_url,
      similarity_threshold
    } = req.body;

    if (!room_id || !type || !title) {
      res.status(400).json({ error: 'room_id, type, and title are required' });
      return;
    }

    const db = getDB();

    // Check if user has permission to edit this room
    const [rooms] = await db.query(
      'SELECT creator_id FROM rooms WHERE id = ?',
      [room_id]
    );

    if (!Array.isArray(rooms) || rooms.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const room = rooms[0] as any;
    if (room.creator_id !== userId) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    const questionId = uuidv4();

    await db.query(`
      INSERT INTO questions (
        id, room_id, type, order_index, title, content, options,
        correct_answer, hint, points, image_url, video_url, similarity_threshold
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      questionId, room_id, type, order_index || 0, title, content || null,
      JSON.stringify(options || []), correct_answer || null, hint || null,
      points || 10, image_url || null, video_url || null, similarity_threshold || 0.6
    ]);

    res.status(201).json({
      message: 'Question created successfully',
      question: { id: questionId, title }
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update question
router.put('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const db = getDB();

    // Check permission
    const [questions] = await db.query(`
      SELECT q.room_id, r.creator_id
      FROM questions q
      JOIN rooms r ON q.room_id = r.id
      WHERE q.id = ?
    `, [id]);

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const question = questions[0] as any;
    if (question.creator_id !== userId) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    // Update question
    const updates = req.body;
    const allowedFields = [
      'type', 'order_index', 'title', 'content', 'options', 'correct_answer',
      'hint', 'points', 'image_url', 'video_url', 'similarity_threshold'
    ];

    const setClause = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .map(key => {
        if (typeof updates[key] === 'object') {
          return JSON.stringify(updates[key]);
        }
        return updates[key];
      });

    if (setClause) {
      await db.query(
        `UPDATE questions SET ${setClause} WHERE id = ?`,
        [...values, id]
      );
    }

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete question
router.delete('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const db = getDB();

    // Check permission
    const [questions] = await db.query(`
      SELECT q.room_id, r.creator_id
      FROM questions q
      JOIN rooms r ON q.room_id = r.id
      WHERE q.id = ?
    `, [id]);

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const question = questions[0] as any;
    if (question.creator_id !== userId) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    await db.query('DELETE FROM questions WHERE id = ?', [id]);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check answer
router.post('/:id/check-answer', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!answer) {
      res.status(400).json({ error: 'Answer is required' });
      return;
    }

    const db = getDB();

    const [questions] = await db.query(
      'SELECT type, correct_answer, similarity_threshold FROM questions WHERE id = ?',
      [id]
    );

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const question = questions[0] as any;
    let isCorrect = false;
    let similarity = 0;

    if (question.type === 'short_answer') {
      // Use similarity calculation for short answer
      similarity = calculateSimilarity(question.correct_answer, answer);
      const threshold = (question.similarity_threshold || 0.6) * 100;
      isCorrect = similarity >= threshold;
    } else {
      // Exact match for other types
      isCorrect = answer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
      similarity = isCorrect ? 100 : 0;
    }

    res.json({
      correct: isCorrect,
      similarity: Math.round(similarity),
      message: isCorrect ? 'Correct!' : 'Incorrect'
    });
  } catch (error) {
    console.error('Check answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

