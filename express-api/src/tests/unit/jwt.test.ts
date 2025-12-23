/**
 * JWT Service Unit Tests
 */
import { describe, it, expect, vi } from 'vitest'
import jwt from 'jsonwebtoken'

// Mock the config before importing the service
vi.mock('#config/index.js', () => ({
  authConfig: {
    jwt: {
      accessSecret: 'test-access-secret-min-32-characters-long',
      refreshSecret: 'test-refresh-secret-min-32-characters-long',
      accessExpiresIn: '15m',
      refreshExpiresIn: '7d',
    },
  },
}))

describe('JWT Service', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid access token', async () => {
      const { generateAccessToken } = await import('#common/services/jwt.js')

      const payload = { sub: 1, email: 'test@example.com', name: 'Test User' }
      const token = generateAccessToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should include payload data in token', async () => {
      const { generateAccessToken } = await import('#common/services/jwt.js')

      const payload = { sub: 1, email: 'test@example.com', name: 'Test User' }
      const token = generateAccessToken(payload)

      const decoded = jwt.decode(token) as Record<string, unknown>
      expect(decoded.sub).toBe(1)
      expect(decoded.email).toBe('test@example.com')
      expect(decoded.name).toBe('Test User')
    })

    it('should set expiration on token', async () => {
      const { generateAccessToken } = await import('#common/services/jwt.js')

      const payload = { sub: 1, email: 'test@example.com', name: 'Test User' }
      const token = generateAccessToken(payload)

      const decoded = jwt.decode(token) as Record<string, unknown>
      expect(decoded.exp).toBeDefined()
      expect(decoded.iat).toBeDefined()
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', async () => {
      const { generateAccessToken, verifyAccessToken } = await import('#common/services/jwt.js')

      const payload = { sub: 1, email: 'test@example.com', name: 'Test User' }
      const token = generateAccessToken(payload)

      const verified = verifyAccessToken(token)
      expect(verified.sub).toBe(1)
      expect(verified.email).toBe('test@example.com')
    })

    it('should throw on invalid token', async () => {
      const { verifyAccessToken } = await import('#common/services/jwt.js')

      expect(() => verifyAccessToken('invalid-token')).toThrow()
    })

    it('should throw on expired token', async () => {
      const { verifyAccessToken } = await import('#common/services/jwt.js')

      // Create an already-expired token
      const expiredToken = jwt.sign(
        { sub: 1, email: 'test@example.com', name: 'Test' },
        'test-access-secret-min-32-characters-long',
        { expiresIn: '-1s' }
      )

      expect(() => verifyAccessToken(expiredToken)).toThrow()
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token with jti', async () => {
      const { generateRefreshToken } = await import('#common/services/jwt.js')

      const payload = { sub: 1, jti: 'unique-token-id' }
      const token = generateRefreshToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const decoded = jwt.decode(token) as Record<string, unknown>
      expect(decoded.sub).toBe(1)
      expect(decoded.jti).toBe('unique-token-id')
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      const { generateRefreshToken, verifyRefreshToken } = await import('#common/services/jwt.js')

      const payload = { sub: 1, jti: 'unique-token-id' }
      const token = generateRefreshToken(payload)

      const verified = verifyRefreshToken(token)
      expect(verified.sub).toBe(1)
      expect(verified.jti).toBe('unique-token-id')
    })
  })
})
