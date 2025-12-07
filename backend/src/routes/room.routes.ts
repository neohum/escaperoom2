import { Router, Request, Response } from 'express';
import { getDB } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, optionalAuth, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all published rooms
router.get('/', optionalAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = getDB();
    const [rooms] = await db.query(`
      SELECT r.id, r.title, r.description, r.category, r.target_grade,
             r.difficulty, r.play_modes, r.play_time_min, r.play_time_max, r.thumbnail,
             r.created_at, u.name as creator_name,
             r.intro_content, r.intro_image, r.author, r.sponsor,
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

// Get creator's own rooms (both published and unpublished)
router.get('/my/rooms', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    console.log('DEBUG: /api/rooms/my/rooms called');
    console.log('DEBUG: userId from token:', userId);
    console.log('DEBUG: full req.user:', (req as AuthRequest));

    const db = getDB();

    const [rooms] = await db.query(`
      SELECT r.id, r.title, r.description, r.category, r.target_grade,
             r.difficulty, r.play_modes, r.play_time_min, r.play_time_max, r.thumbnail,
             r.is_published, r.created_at, r.updated_at,
             r.intro_content, r.intro_image, r.author, r.sponsor,
             (SELECT COUNT(*) FROM questions WHERE room_id = r.id) as question_count
      FROM rooms r
      WHERE r.creator_id = ?
      ORDER BY r.updated_at DESC
    `, [userId]);

    res.json({ rooms });
  } catch (error) {
    console.error('Get my rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get room by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDB();

    const [rooms] = await db.query(`
      SELECT r.*, u.name as creator_name
      FROM rooms r
      LEFT JOIN users u ON r.creator_id = u.id
      WHERE r.id = ?
    `, [id]);

    if (!Array.isArray(rooms) || rooms.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const room = rooms[0] as any;

    // Get team members
    const [teamMembers] = await db.query(`
      SELECT tm.id, tm.role, tm.permissions, tm.guest_token, u.name as username
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
router.post('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const {
      title,
      description,
      category,
      target_grade,
      difficulty,
      play_modes,
      play_time_min,
      play_time_max,
      credits,
      donation_info,
      intro_content,
      intro_image,
      author,
      sponsor
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const db = getDB();
    const roomId = uuidv4();
    const editToken = uuidv4();

    await db.query(`
      INSERT INTO rooms (
        id, title, description, category, target_grade, difficulty,
        play_modes, play_time_min, play_time_max, creator_id, edit_token, credits, donation_info, intro_content, intro_image, author, sponsor
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      roomId, title, description || null, category || null, target_grade || null,
      difficulty || 3, JSON.stringify(play_modes || ['online']), play_time_min || 30, play_time_max || 60,
      userId, editToken, JSON.stringify(credits || {}), JSON.stringify(donation_info || {}),
      intro_content || null, intro_image || null, author || null, sponsor || null
    ]);

    // Create default scene for intro
    if (intro_content || intro_image) {
      const sceneId = uuidv4();
      await db.query(
        `INSERT INTO scenes 
         (id, room_id, order_index, title, description, background_image, background_color, content, layout_type, transition_type, auto_advance, auto_advance_delay)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sceneId,
          roomId,
          0,
          '소개',
          '',
          intro_image || null,
          '#ffffff',
          intro_content ? JSON.stringify({ text: intro_content }) : '',
          'image_text',
          'fade',
          0,
          0
        ]
      );
    }

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
router.put('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
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
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const room = rooms[0] as any;
    if (room.creator_id !== userId) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    // Update room
    const updates = req.body;
    const allowedFields = [
      'title', 'description', 'category', 'target_grade', 'difficulty',
      'play_modes', 'play_time_min', 'play_time_max', 'is_published', 'credits', 'donation_info',
      'thumbnail'
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
import path from 'path';
import fs from 'fs';
const uploadsDir = path.join(__dirname, '../../uploads');

router.delete('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
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
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const room = rooms[0] as any;
    if (room.creator_id !== userId) {
      res.status(403).json({ error: 'Permission denied' });
      return;
    }

    // 1. Find all scenes for this room and collect image filenames
    const [scenes] = await db.query<any[]>(
      'SELECT background_image FROM scenes WHERE room_id = ?',
      [id]
    );
    const imageFiles = (scenes || [])
      .map(s => s.background_image)
      .filter(Boolean)
      .map((img: string) => {
        // Extract filename from /uploads/filename or just filename
        const match = img.match(/(?:\/uploads\/)?([\w\-]+\.[a-zA-Z0-9]+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    // 2. Delete room (cascade will handle related records)
    await db.query('DELETE FROM rooms WHERE id = ?', [id]);

    // 3. Delete image files
    for (const filename of imageFiles) {
      if (typeof filename === 'string') {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
        }
      }
    }

    res.json({ message: 'Room and related images deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Publish room
router.post('/:id/publish', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const db = getDB();

    const [rooms] = await db.query(
      'SELECT creator_id FROM rooms WHERE id = ?',
      [id]
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
router.post('/:id/unpublish', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthRequest).userId;
    const { id } = req.params;
    const db = getDB();

    const [rooms] = await db.query(
      'SELECT creator_id FROM rooms WHERE id = ?',
      [id]
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

