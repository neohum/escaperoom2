import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/room.routes';
import questionRoutes from './routes/question.routes';
import gameRoutes from './routes/game.routes';
import uploadRoutes from './routes/upload.routes';
import sceneRoutes from './routes/scene.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import passport from './config/passport';

// Import database connections
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';

// Import WebSocket handler
import { setupWebSocket } from './services/websocket.service';

const app: Application = express();
const PORT = process.env.PORT || 4000;
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:6263', 'http://localhost:3000'];
const FRONTEND_URL = process.env.FRONTEND_URL || DEFAULT_ALLOWED_ORIGINS[0];
const EXTRA_ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : [];
const allowedOrigins = Array.from(new Set([FRONTEND_URL, ...DEFAULT_ALLOWED_ORIGINS, ...EXTRA_ALLOWED_ORIGINS]));

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Middleware
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 정적 파일 서빙 (업로드된 파일)
// Ensure CORS headers for static files (images, SVGs)
import path from 'path';
const uploadsPath = path.resolve(__dirname, '../uploads');
console.log('Static uploads path:', uploadsPath);
app.use('/uploads',
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  },
  express.static(uploadsPath)
);

// Initialize Passport
app.use(passport.initialize());

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/scenes', sceneRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    
    // Connect to MySQL
    await connectDB();
    console.log('✅ MySQL connected');

    // Connect to Redis
    await connectRedis();
    console.log('✅ Redis connected');

    // Setup WebSocket (after Redis is connected)
    setupWebSocket(wss);
    console.log('✅ WebSocket setup complete');

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🖥️ Frontend available at ${FRONTEND_URL}`);
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
      console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
