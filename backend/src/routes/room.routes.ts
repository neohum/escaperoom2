import { Router } from 'express';

const router = Router();

// TODO: Implement room routes
// GET /api/rooms - Get all published rooms
// GET /api/rooms/:id - Get room by ID
// POST /api/rooms - Create new room
// PUT /api/rooms/:id - Update room
// DELETE /api/rooms/:id - Delete room
// GET /api/rooms/:id/questions - Get room questions
// POST /api/rooms/:id/publish - Publish room
// POST /api/rooms/:id/unpublish - Unpublish room

router.get('/', (req, res) => {
  res.json({ message: 'Get all rooms - TODO', data: [] });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get room by ID - TODO', id: req.params.id });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create room - TODO' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update room - TODO', id: req.params.id });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete room - TODO', id: req.params.id });
});

export default router;

