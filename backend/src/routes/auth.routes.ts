import { Router } from 'express';

const router = Router();

// TODO: Implement authentication routes
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
// GET /api/auth/me
// GET /api/auth/google
// GET /api/auth/google/callback
// GET /api/auth/kakao
// GET /api/auth/kakao/callback
// GET /api/auth/naver
// GET /api/auth/naver/callback

router.post('/register', (req, res) => {
  res.json({ message: 'Register endpoint - TODO' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint - TODO' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout endpoint - TODO' });
});

router.get('/me', (req, res) => {
  res.json({ message: 'Get current user - TODO' });
});

export default router;

