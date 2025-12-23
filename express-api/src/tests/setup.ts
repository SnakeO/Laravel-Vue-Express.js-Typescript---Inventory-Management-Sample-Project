/**
 * Vitest test setup - runs before all tests
 */
import { vi } from 'vitest'

// Mock Redis client
export const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  on: vi.fn(),
  quit: vi.fn(),
}

// Mock Laravel HTTP client
export const mockLaravelClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

// Apply mocks globally
vi.mock('#common/services/redis.js', () => ({
  redis: mockRedis,
}))

vi.mock('#common/services/laravel.js', () => ({
  laravelClient: mockLaravelClient,
}))

vi.mock('#config/index.js', () => ({
  redisConfig: {
    host: 'localhost',
    port: 6379,
    cacheTtl: 300,
  },
  appConfig: {
    port: 3001,
    env: 'test',
    laravelApiUrl: 'http://localhost:8000/api/v1',
  },
  authConfig: {
    jwt: {
      accessSecret: 'test-access-secret-min-32-characters-long',
      refreshSecret: 'test-refresh-secret-min-32-characters-long',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    },
    redis: {
      refreshTokenPrefix: 'refresh_token:',
      refreshTokenTtl: 604800,
    },
  },
}))
