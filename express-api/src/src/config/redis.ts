export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  cacheTtl: parseInt(process.env.CACHE_TTL || '300', 10),
}
