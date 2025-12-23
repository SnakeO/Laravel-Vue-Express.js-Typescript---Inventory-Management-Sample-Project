/**
 * JWT Authentication configuration
 */
export const authConfig = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-this-access-secret-in-production-min-32-chars',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-this-refresh-secret-in-production-min-32-chars',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redis: {
    refreshTokenPrefix: 'refresh_token:',
    refreshTokenTtl: 7 * 24 * 60 * 60, // 7 days in seconds
  },
}
