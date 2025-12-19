/**
 * Tests for webhook authentication middleware
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import type { Request, Response, NextFunction } from 'express'

const TEST_SECRET = 'test-webhook-secret'

jest.unstable_mockModule('#config/index.js', () => ({
  webhookConfig: {
    secret: TEST_SECRET,
  },
}))

describe('webhookAuth middleware', () => {
  let webhookAuth: typeof import('../webhookAuth.js').webhookAuth
  let mockReq: Partial<Request>
  let mockRes: {
    json: ReturnType<typeof jest.fn>
    status: ReturnType<typeof jest.fn>
  }
  let mockNext: NextFunction

  beforeEach(async () => {
    const middleware = await import('../webhookAuth.js')
    webhookAuth = middleware.webhookAuth

    mockReq = {
      headers: {},
    }
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
    jest.clearAllMocks()
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
