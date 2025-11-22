import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { getDB } from './database';
import { v4 as uuidv4 } from 'uuid';

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const db = getDB();
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          // Check if user exists
          const [users] = await db.query<any[]>(
            'SELECT * FROM users WHERE email = ? OR (provider = ? AND provider_id = ?)',
            [email, 'google', profile.id]
          );

          let user = users[0];

          if (!user) {
            // Create new user
            const userId = uuidv4();
            const username = profile.displayName || email.split('@')[0];

            await db.query(
              `INSERT INTO users (id, email, name, provider, provider_id, role, created_at)
               VALUES (?, ?, ?, ?, ?, ?, NOW())`,
              [userId, email, username, 'google', profile.id, 'creator']
            );

            user = {
              id: userId,
              email,
              name: username,
              provider: 'google',
              provider_id: profile.id,
              role: 'creator',
            };
          } else if (!user.provider || user.provider === 'local') {
            // Link existing email account with Google
            await db.query(
              'UPDATE users SET provider = ?, provider_id = ? WHERE id = ?',
              ['google', profile.id, user.id]
            );
            user.provider = 'google';
            user.provider_id = profile.id;
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

// Kakao OAuth Strategy
if (process.env.KAKAO_CLIENT_ID) {
  const kakaoConfig: any = {
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/kakao/callback`,
  };
  
  // Add clientSecret if provided
  if (process.env.KAKAO_CLIENT_SECRET) {
    kakaoConfig.clientSecret = process.env.KAKAO_CLIENT_SECRET;
  }
  
  passport.use(
    new KakaoStrategy(
      kakaoConfig,
      async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
        try {
          const db = getDB();
          const email = profile._json?.kakao_account?.email;
          const nickname = profile.displayName || profile._json?.properties?.nickname;

          if (!email) {
            return done(new Error('No email found in Kakao profile. Please check email consent settings.'));
          }

          // Check if user exists
          const [users] = await db.query<any[]>(
            'SELECT * FROM users WHERE email = ? OR (provider = ? AND provider_id = ?)',
            [email, 'kakao', profile.id]
          );

          let user = users[0];

          if (!user) {
            // Create new user
            const userId = uuidv4();
            const username = nickname || email.split('@')[0];

            await db.query(
              `INSERT INTO users (id, email, name, provider, provider_id, role, created_at)
               VALUES (?, ?, ?, ?, ?, ?, NOW())`,
              [userId, email, username, 'kakao', profile.id, 'creator']
            );

            user = {
              id: userId,
              email,
              name: username,
              provider: 'kakao',
              provider_id: profile.id,
              role: 'creator',
            };
          } else if (!user.provider || user.provider === 'local') {
            // Link existing email account with Kakao
            await db.query(
              'UPDATE users SET provider = ?, provider_id = ? WHERE id = ?',
              ['kakao', profile.id, user.id]
            );
            user.provider = 'kakao';
            user.provider_id = profile.id;
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const db = getDB();
    const [users] = await db.query<any[]>('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error);
  }
});

export default passport;

