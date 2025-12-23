/**
 * Auth API Integration Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  on: vi.fn(),
}

// Mock Laravel client
const mockLaravelClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

vi.mock('#common/services/redis.js', () => ({
  redis: mockRedis,
}))

vi.mock('#common/services/laravel.js', () => ({
  laravelClient: mockLaravelClient,
}))

vi.mock('#config/index.js', () => ({
  appConfig: { port: 3001, env: 'test', laravelApiUrl: 'http://localhost:8000/api/v1' },
  redisConfig: { host: 'localhost', port: 6379, cacheTtl: 300 },
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

describe('Auth API', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.clearAllMocks()

    // Create fresh Express app for each test
    app = express()
    app.use(express.json())

    const { routes } = await import('#modules/auth/index.js')
    app.use('/auth', routes)

    // Error handler middleware (mirrors production error handler)
    app.use((err: Error & { status?: number; response?: { status: number } }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      // Axios errors from Laravel validation
      if (err.response?.status === 422) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }
      // JWT errors
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ||
          err.message.includes('Refresh token') || err.message.includes('jwt')) {
        res.status(401).json({ error: err.message })
        return
      }
      const status = err.status || 500
      res.status(status).json({ error: err.message })
    })
  })

  describe('POST /auth/login', () => {
    it('should return tokens on valid credentials', async () => {
      mockLaravelClient.post.mockResolvedValue({
        data: {
          data: { id: 1, name: 'Test User', email: 'test@example.com' },
        },
      })
      mockRedis.setex.mockResolvedValue('OK')

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data).toHaveProperty('tokens')
      expect(response.body.data.tokens).toHaveProperty('accessToken')
      expect(response.body.data.tokens).toHaveProperty('refreshToken')
      expect(response.body.data.tokens).toHaveProperty('expiresIn')
      expect(response.body.data.user.email).toBe('test@example.com')
    })

    it('should return 401 on invalid credentials', async () => {
      mockLaravelClient.post.mockRejectedValue({
        response: { status: 422, data: { message: 'Invalid credentials' } },
      })

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })

      expect(response.status).toBe(401)
    })

    it('should return 400 on missing email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ password: 'password123' })

      expect(response.status).toBe(400)
    })

    it('should return 400 on missing password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com' })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /auth/refresh', () => {
    it('should return new access token on valid refresh token', async () => {
      // First login to get tokens
      mockLaravelClient.post.mockResolvedValue({
        data: {
          data: { id: 1, name: 'Test User', email: 'test@example.com' },
        },
      })
      mockRedis.setex.mockResolvedValue('OK')

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      const { refreshToken } = loginResponse.body.data.tokens

      // Mock Redis returning the stored refresh token data
      mockRedis.get.mockResolvedValue(JSON.stringify({
        userId: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString(),
      }))

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveProperty('accessToken')
      expect(response.body.data).toHaveProperty('expiresIn')
    })

    it('should return 401 on invalid refresh token', async () => {
      mockRedis.get.mockResolvedValue(null)

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })

      expect(response.status).toBe(401)
    })
  })

  describe('POST /auth/logout', () => {
    it('should invalidate refresh token', async () => {
      // First login
      mockLaravelClient.post.mockResolvedValue({
        data: {
          data: { id: 1, name: 'Test User', email: 'test@example.com' },
        },
      })
      mockRedis.setex.mockResolvedValue('OK')

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })

      const { refreshToken } = loginResponse.body.data.tokens

      // Mock successful deletion
      mockRedis.del.mockResolvedValue(1)

      const response = await request(app)
        .post('/auth/logout')
        .send({ refreshToken })

      expect(response.status).toBe(200)
      expect(mockRedis.del).toHaveBeenCalled()
    })
  })
})
