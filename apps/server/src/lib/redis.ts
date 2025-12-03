import { Redis, type RedisOptions } from 'ioredis';

// Redis connection configuration
export const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  family: 4, // Force IPv4 to avoid issues with Node 17+ preferring IPv6
  maxRetriesPerRequest: null, // Required for BullMQ
  connectTimeout: 30000, // Increase timeout to 30s
  keepAlive: 10000, // TCP KeepAlive every 10s
};

// Redis client instance for direct operations
export const redis_client = new Redis(redisConnection);
