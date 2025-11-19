import { Router, Request, Response } from 'express';
import { getDB } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, optionalAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all published rooms
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const [rooms] = await db.query(`
      SELECT r.id, r.title, r.description, r.category, r.target_grade,
             r.difficulty, r.play_modes, r.estimated_time, r.thumbnail_url,
             r.created_at, u.username as creator_name,
             (SELECT COUNT(*) FROM questions WHERE room_id = r.id) as question_count
      FROM rooms r
      LEFT JOIN users u ON r.creator_id = u.id
      WHERE r.is_published = 1
      ORDER BY r.created_at DESC
      LIMIT 50
    `);

    res.json({ rooms });
  } catch (error) {
    console.error('List rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get room by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [rooms] = await db.query(`
      SELECT r.*, u.username as creator_name
      FROM rooms r
      LEFT JOIN users u ON r.creator_id = u.id
      WHERE r.id = ?
    `, [id]);

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rooms[0] as any;

    // Get team members
    const [teamMembers] = await db.query(`
      SELECT tm.id, tm.role, tm.permissions, tm.guest_token, u.username
      FROM team_members tm
      LEFT JOIN users u ON tm.user_id = u.id
      WHERE tm.room_id = ?
    `, [id]);

    room.team_members = teamMembers;

    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new room
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    const {
      title,
      description,
      category,
      target_grade,
      difficulty,
      play_modes,
      estimated_time,
      credits,
      donation_info
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const db = getDB();
    const roomId = uuidv4();
    const editToken = uuidv4();

    await db.query(`
      INSERT INTO rooms (
        id, title, description, category, target_grade, difficulty,
        play_modes, estimated_time, creator_id, edit_token, credits, donation_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      roomId, title, description || null, category || null, target_grade || null,
      difficulty || 3, JSON.stringify(play_modes || ['online']), estimated_time || 60,
      userId, editToken, JSON.stringify(credits || {}), JSON.stringify(donation_info || {})
    ]);

    // Add creator as team member with admin role
    await db.query(`
      INSERT INTO team_members (id, room_id, user_id, role, permissions)
      VALUES (?, ?, ?, 'admin', ?)
    `, [uuidv4(), roomId, userId, JSON.stringify(['all'])]);

    res.status(201).json({
      message: 'Room created successfully',
      room: { id: roomId, title, edit_token: editToken }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update room
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const db = getDB();

    // Check permission
    const [rooms] = await db.query(
      'SELECT creator_id FROM rooms WHERE id = ?',
      [id]
    );

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rooms[0] as any;
    if (room.creator_id !== userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Update room
    const updates = req.body;
    const allowedFields = [
      'title', 'description', 'category', 'target_grade', 'difficulty',
      'play_modes', 'estimated_time', 'is_published', 'credits', 'donation_info',
      'thumbnail_url'
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
        `UPDATE rooms SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        [...values, id]
      );
    }

    res.json({ message: 'Room updated successfully' });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete room
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const db = getDB();

    // Check permission
    const [rooms] = await db.query(
      'SELECT creator_id FROM rooms WHERE id = ?',
      [id]
    );

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rooms[0] as any;
    if (room.creator_id !== userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Delete room (cascade will handle related records)
    await db.query('DELETE FROM rooms WHERE id = ?', [id]);

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Publish room
router.post('/:id/publish', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const db = getDB();

    const [rooms] = await db.query(
      'SELECT creator_id FROM rooms WHERE id = ?',
      [id]
    );

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rooms[0] as any;
    if (room.creator_id !== userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await db.query(
      'UPDATE rooms SET is_published = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({ message: 'Room published successfully' });
  } catch (error) {
    console.error('Publish room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unpublish room
router.post('/:id/unpublish', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const db = getDB();

    const [rooms] = await db.query(
      'SELECT creator_id FROM rooms WHERE id = ?',
      [id]
    );

    if (!Array.isArray(rooms) || rooms.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = rooms[0] as any;
    if (room.creator_id !== userId) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    await db.query(
      'UPDATE rooms SET is_published = 0, updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({ message: 'Room unpublished successfully' });
  } catch (error) {
    console.error('Unpublish room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

