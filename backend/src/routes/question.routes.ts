import { Router } from 'express';

const router = Router();

// TODO: Implement question routes
// GET /api/questions/:id - Get question by ID
// POST /api/questions - Create question
// PUT /api/questions/:id - Update question
// DELETE /api/questions/:id - Delete question
// POST /api/questions/:id/check-answer - Check answer

router.get('/:id', (req, res) => {
  res.json({ message: 'Get question - TODO', id: req.params.id });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create question - TODO' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'Update question - TODO', id: req.params.id });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete question - TODO', id: req.params.id });
});

router.post('/:id/check-answer', (req, res) => {
  res.json({ message: 'Check answer - TODO', id: req.params.id });
});

export default router;

