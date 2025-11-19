import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import passport from '../config/passport';

const router = Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username, provider = 'local' } = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, password, and username are required' });
      return;
    }

    const db = getDB();

    // Check if user exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    await db.query(
      'INSERT INTO users (id, email, password, username, provider) VALUES (?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, username, provider]
    );

    // Generate JWT
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email, username }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const db = getDB();

    // Find user
    const [users] = await db.query(
      'SELECT id, email, password, username, provider FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = users[0] as any;

    // Check if local provider
    if (user.provider !== 'local') {
      res.status(400).json({ error: `Please login with ${user.provider}` });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal)
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});

// Get current user
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const db = getDB();

    const [users] = await db.query(
      'SELECT id, email, username, provider, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ============================================
// OAuth Routes
// ============================================

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google` }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Redirect to frontend with token
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }))}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=google`);
    }
  }
);

// Kakao OAuth
router.get('/kakao', passport.authenticate('kakao', { session: false }));

router.get('/kakao/callback',
  passport.authenticate('kakao', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=kakao` }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Redirect to frontend with token
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }))}`);
    } catch (error) {
      console.error('Kakao callback error:', error);
      res.redirect(`${FRONTEND_URL}/login?error=kakao`);
    }
  }
);

// Naver OAuth (Manual implementation - no official passport strategy)
router.get('/naver', (_req: Request, res: Response): void => {
  const clientId = process.env.NAVER_CLIENT_ID;
  const callbackUrl = encodeURIComponent(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/naver/callback`);
  const state = Math.random().toString(36).substring(7);

  if (!clientId) {
    res.redirect(`${FRONTEND_URL}/login?error=naver_not_configured`);
    return;
  }

  const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callbackUrl}&state=${state}`;
  res.redirect(naverAuthUrl);
});

router.get('/naver/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!code || !clientId || !clientSecret) {
      return res.redirect(`${FRONTEND_URL}/login?error=naver`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code as string,
        state: state as string,
      }),
    });

    const tokenData = await tokenResponse.json() as any;

    if (!tokenData.access_token) {
      res.redirect(`${FRONTEND_URL}/login?error=naver`);
      return;
    }

    // Get user profile
    const profileResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profileData = await profileResponse.json() as any;

    if (profileData.resultcode !== '00') {
      res.redirect(`${FRONTEND_URL}/login?error=naver`);
      return;
    }

    const profile = profileData.response;
    const email = profile.email;
    const nickname = profile.nickname || profile.name;

    if (!email) {
      res.redirect(`${FRONTEND_URL}/login?error=naver_no_email`);
      return;
    }

    const db = getDB();

    // Check if user exists
    const [users] = await db.query<any[]>(
      'SELECT * FROM users WHERE email = ? OR (oauth_provider = ? AND oauth_id = ?)',
      [email, 'naver', profile.id]
    );

    let user = users[0];

    if (!user) {
      // Create new user
      const userId = uuidv4();
      const username = nickname || email.split('@')[0];

      await db.query(
        `INSERT INTO users (id, email, username, oauth_provider, oauth_id, provider)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, email, username, 'naver', profile.id, 'naver']
      );

      user = {
        id: userId,
        email,
        username,
        oauth_provider: 'naver',
        oauth_id: profile.id,
      };
    } else if (!user.oauth_provider) {
      // Link existing email account with Naver
      await db.query(
        'UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE id = ?',
        ['naver', profile.id, user.id]
      );
      user.oauth_provider = 'naver';
      user.oauth_id = profile.id;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'creator'
    }))}`);
  } catch (error) {
    console.error('Naver callback error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=naver`);
  }
});

export default router;

