import { Redis } from 'ioredis';
import type { ConnectionOptions } from 'bullmq';

// Redis connection configuration
export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: 'default',
  password: process.env.REDIS_PASSWORD,
};

// Redis client instance for direct operations
export const redis_client = new Redis(redisConnection);
