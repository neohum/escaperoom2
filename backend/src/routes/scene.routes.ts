import { Router, Request, Response } from 'express';
import { getDB } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();
const authenticateToken = verifyToken;

// Get all scenes for a room
router.get('/room/:roomId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    const db = getDB();

    const [scenes] = await db.query(
      `SELECT * FROM scenes WHERE room_id = ? ORDER BY order_index ASC`,
      [roomId]
    );

    res.json({ scenes });
  } catch (error) {
    console.error('Get scenes error:', error);
    res.status(500).json({ error: '생성된 화면이 없습니다.' });
  }
});

// Get a single scene with elements
router.get('/:sceneId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sceneId } = req.params;
    const db = getDB();

    const [scenes] = await db.query<any[]>(
      'SELECT * FROM scenes WHERE id = ?',
      [sceneId]
    );

    if (!Array.isArray(scenes) || scenes.length === 0) {
      res.status(404).json({ error: 'Scene not found' });
      return;
    }

    const scene = scenes[0];

    // Get scene elements
    const [elements] = await db.query(
      'SELECT * FROM scene_elements WHERE scene_id = ? ORDER BY order_index ASC',
      [sceneId]
    );

    scene.elements = elements;

    res.json({ scene });
  } catch (error) {
    console.error('Get scene error:', error);
    res.status(500).json({ error: 'Failed to fetch scene' });
  }
});

// Create a new scene
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      room_id,
      title,
      description,
      background_image,
      background_color,
      content,
      layout_type,
      transition_type,
      auto_advance,
      auto_advance_delay
    } = req.body;

    if (!room_id || !title) {
      res.status(400).json({ error: 'room_id and title are required' });
      return;
    }

    const db = getDB();

    // Get the next order_index
    const [maxOrder] = await db.query<any[]>(
      'SELECT MAX(order_index) as max_order FROM scenes WHERE room_id = ?',
      [room_id]
    );
    const nextOrder = (maxOrder[0]?.max_order || -1) + 1;

    const sceneId = uuidv4();
    await db.query(
      `INSERT INTO scenes 
       (id, room_id, order_index, title, description, background_image, background_color, 
        content, layout_type, transition_type, auto_advance, auto_advance_delay)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sceneId,
        room_id,
        nextOrder,
        title,
        description || null,
        background_image || null,
        background_color || '#ffffff',
        JSON.stringify(content || {}),
        layout_type && layout_type !== '' ? layout_type : 'image_text',
        transition_type || 'fade',
        auto_advance ? 1 : 0,
        auto_advance_delay || 0
      ]
    );

    const [newScene] = await db.query<any[]>(
      'SELECT * FROM scenes WHERE id = ?',
      [sceneId]
    );

    res.status(201).json({
      message: 'Scene created successfully',
      scene: newScene[0]
    });
  } catch (error) {
    console.error('Create scene error:', error);
    res.status(500).json({ error: 'Failed to create scene' });
  }
});

// Update a scene
router.put('/:sceneId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sceneId } = req.params;
    const {
      title,
      description,
      background_image,
      background_color,
      content,
      layout_type,
      transition_type,
      auto_advance,
      auto_advance_delay,
      order_index
    } = req.body;

    const db = getDB();

    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (background_image !== undefined) {
      updates.push('background_image = ?');
      values.push(background_image);
    }
    if (background_color !== undefined) {
      updates.push('background_color = ?');
      values.push(background_color);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(JSON.stringify(content));
    }
    if (layout_type !== undefined) {
      updates.push('layout_type = ?');
      values.push(layout_type);
    }
    if (transition_type !== undefined) {
      updates.push('transition_type = ?');
      values.push(transition_type);
    }
    if (auto_advance !== undefined) {
      updates.push('auto_advance = ?');
      values.push(auto_advance ? 1 : 0);
    }
    if (auto_advance_delay !== undefined) {
      updates.push('auto_advance_delay = ?');
      values.push(auto_advance_delay);
    }
    if (order_index !== undefined) {
      updates.push('order_index = ?');
      values.push(order_index);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(sceneId);

    await db.query(
      `UPDATE scenes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedScene] = await db.query<any[]>(
      'SELECT * FROM scenes WHERE id = ?',
      [sceneId]
    );

    res.json({
      message: 'Scene updated successfully',
      scene: updatedScene[0]
    });
  } catch (error) {
    console.error('Update scene error:', error);
    res.status(500).json({ error: 'Failed to update scene' });
  }
});

// Delete a scene
router.delete('/:sceneId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sceneId } = req.params;
    const db = getDB();

    await db.query('DELETE FROM scenes WHERE id = ?', [sceneId]);

    res.json({ message: 'Scene deleted successfully' });
  } catch (error) {
    console.error('Delete scene error:', error);
    res.status(500).json({ error: 'Failed to delete scene' });
  }
});

// Add element to scene
router.post('/:sceneId/elements', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sceneId } = req.params;
    const { element_type, content, style, action } = req.body;

    if (!element_type) {
      res.status(400).json({ error: 'element_type is required' });
      return;
    }

    const db = getDB();

    // Get the next order_index
    const [maxOrder] = await db.query<any[]>(
      'SELECT MAX(order_index) as max_order FROM scene_elements WHERE scene_id = ?',
      [sceneId]
    );
    const nextOrder = (maxOrder[0]?.max_order || -1) + 1;

    const elementId = uuidv4();
    await db.query(
      `INSERT INTO scene_elements (id, scene_id, element_type, order_index, content, style, action)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        elementId,
        sceneId,
        element_type,
        nextOrder,
        content || null,
        JSON.stringify(style || {}),
        JSON.stringify(action || {})
      ]
    );

    const [newElement] = await db.query<any[]>(
      'SELECT * FROM scene_elements WHERE id = ?',
      [elementId]
    );

    res.status(201).json({
      message: 'Element created successfully',
      element: newElement[0]
    });
  } catch (error) {
    console.error('Create element error:', error);
    res.status(500).json({ error: 'Failed to create element' });
  }
});

// Update element
router.put('/elements/:elementId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { elementId } = req.params;
    const { content, style, action, order_index } = req.body;

    const db = getDB();

    const updates: string[] = [];
    const values: any[] = [];

    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (style !== undefined) {
      updates.push('style = ?');
      values.push(JSON.stringify(style));
    }
    if (action !== undefined) {
      updates.push('action = ?');
      values.push(JSON.stringify(action));
    }
    if (order_index !== undefined) {
      updates.push('order_index = ?');
      values.push(order_index);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(elementId);

    await db.query(
      `UPDATE scene_elements SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updatedElement] = await db.query<any[]>(
      'SELECT * FROM scene_elements WHERE id = ?',
      [elementId]
    );

    res.json({
      message: 'Element updated successfully',
      element: updatedElement[0]
    });
  } catch (error) {
    console.error('Update element error:', error);
    res.status(500).json({ error: 'Failed to update element' });
  }
});

// Delete element
router.delete('/elements/:elementId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { elementId } = req.params;
    const db = getDB();

    await db.query('DELETE FROM scene_elements WHERE id = ?', [elementId]);

    res.json({ message: 'Element deleted successfully' });
  } catch (error) {
    console.error('Delete element error:', error);
    res.status(500).json({ error: 'Failed to delete element' });
  }
});

export default router;
