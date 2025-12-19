/**
 * Redis client for caching product data
 */
import Redis from 'ioredis'
import { redisConfig } from '#config/index.js'

export const redis = new Redis({
  host: redisConfig.host,
  port: redisConfig.port,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries')
      return null
    }
    return Math.min(times * 200, 2000)
  },
})

redis.on('connect', () => {
  console.log('Redis connected')
})

redis.on('error', (err) => {
  console.error('Redis error:', err.message)
})
