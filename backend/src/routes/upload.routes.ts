import { Router } from 'express';

const router = Router();

// TODO: Implement upload routes
// POST /api/upload/image - Upload and convert to SVG
// POST /api/upload/file - Upload general file
// DELETE /api/upload/:filename - Delete uploaded file

router.post('/image', (req, res) => {
  res.json({ message: 'Upload image - TODO' });
});

router.post('/file', (req, res) => {
  res.json({ message: 'Upload file - TODO' });
});

router.delete('/:filename', (req, res) => {
  res.json({ message: 'Delete file - TODO', filename: req.params.filename });
});

export default router;

