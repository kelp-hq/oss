/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, RedisClientType } from 'redis';

import { getEnv } from './utils/env';

export let redisClient: RedisClientType;
/**
 * Create and return the Redis Client
 * @returns
 */
export async function createRedisInstance(): Promise<RedisClientType> {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: getEnv('REDIS_URL', 'redis://127.0.0.1:6379')
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));

  await redisClient.connect();

  return redisClient;
}
