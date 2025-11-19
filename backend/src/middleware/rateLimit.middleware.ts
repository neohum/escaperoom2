import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../config/redis';

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const redis = getRedis();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit:${ip}`;

    const limit = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
    const window = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') / 1000;

    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, window);
    }

    if (requests > limit) {
      const ttl = await redis.ttl(key);
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: ttl,
      });
      return;
    }

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - requests).toString());

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // If Redis fails, allow the request
    next();
  }
}

