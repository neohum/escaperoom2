import { Router } from 'express';

const router = Router();

// TODO: Implement game routes
// POST /api/game/start - Start game session
// POST /api/game/submit-answer - Submit answer
// GET /api/game/session/:id - Get session progress
// POST /api/game/complete - Complete game
// GET /api/game/badges - Get user badges

router.post('/start', (_req, res) => {
  res.json({ message: 'Start game - TODO' });
});

router.post('/submit-answer', (_req, res) => {
  res.json({ message: 'Submit answer - TODO' });
});

router.get('/session/:id', (req, res) => {
  res.json({ message: 'Get session - TODO', id: req.params.id });
});

router.post('/complete', (_req, res) => {
  res.json({ message: 'Complete game - TODO' });
});

router.get('/badges', (_req, res) => {
  res.json({ message: 'Get badges - TODO', data: [] });
});

export default router;

