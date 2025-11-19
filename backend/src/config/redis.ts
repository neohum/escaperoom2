import Redis from 'ioredis';

let redis: Redis | null = null;
let subscriber: Redis | null = null;
let publisher: Redis | null = null;

export async function connectRedis(): Promise<Redis> {
  if (redis) {
    return redis;
  }

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    redis.on('connect', () => {
      console.log('Redis client connected');
    });

    redis.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    // Create subscriber and publisher for Pub/Sub
    subscriber = redis.duplicate();
    publisher = redis.duplicate();

    await redis.ping();
    console.log('Redis connection established');

    return redis;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redis;
}

export function getSubscriber(): Redis {
  if (!subscriber) {
    throw new Error('Redis subscriber not initialized.');
  }
  return subscriber;
}

export function getPublisher(): Redis {
  if (!publisher) {
    throw new Error('Redis publisher not initialized.');
  }
  return publisher;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
  if (subscriber) {
    await subscriber.quit();
    subscriber = null;
  }
  if (publisher) {
    await publisher.quit();
    publisher = null;
  }
  console.log('Redis connections closed');
}

