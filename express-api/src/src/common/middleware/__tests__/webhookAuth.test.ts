/**
 * Tests for webhook authentication middleware
 */
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'

const TEST_SECRET = 'test-webhook-secret'

vi.mock('#config/index.js', () => ({
  webhookConfig: {
    secret: TEST_SECRET,
  },
}))

describe('webhookAuth middleware', () => {
  let webhookAuth: typeof import('../webhookAuth.js').webhookAuth
  let mockReq: Partial<Request>
  let mockRes: {
    json: ReturnType<typeof vi.fn>
    status: ReturnType<typeof vi.fn>
  }
  let mockNext: NextFunction

  beforeEach(async () => {
    const middleware = await import('../webhookAuth.js')
    webhookAuth = middleware.webhookAuth

    mockReq = {
      headers: {},
    }
    mockRes = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    }
    mockNext = vi.fn()
    vi.clearAllMocks()
  })

  it('should call next() when valid secret is provided', () => {
    mockReq.headers = { 'x-webhook-secret': TEST_SECRET }

    webhookAuth(mockReq as Request, mockRes as unknown as Response, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(mockRes.status).not.toHaveBeenCalled()
  })

  it('should return 401 when secret is missing', () => {
    mockReq.headers = {}

    webhookAuth(mockReq as Request, mockRes as unknown as Response, mockNext)

    expect(mockNext).not.toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Invalid webhook secret',
    })
  })

  it('should return 401 when secret is invalid', () => {
    mockReq.headers = { 'x-webhook-secret': 'wrong-secret' }

    webhookAuth(mockReq as Request, mockRes as unknown as Response, mockNext)

    expect(mockNext).not.toHaveBeenCalled()
    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'Invalid webhook secret',
    })
  })
})
