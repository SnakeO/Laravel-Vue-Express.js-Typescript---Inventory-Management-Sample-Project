import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import type { Request, Response, NextFunction } from 'express'

// Mock Redis at boundary
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  on: jest.fn(),
}

jest.unstable_mockModule('#common/services/redis.js', () => ({
  redis: mockRedis,
}))

jest.unstable_mockModule('#common/services/laravel.js', () => ({
  laravelClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

jest.unstable_mockModule('#config/index.js', () => ({
  redisConfig: {
    host: 'localhost',
    port: 6379,
    cacheTtl: 300,
  },
  laravelConfig: {
    apiUrl: 'http://localhost:8000/api/v1',
    timeout: 5000,
  },
}))

describe('Cache Controller', () => {
  let controller: typeof import('../cache.controller.js')
  let mockReq: Partial<Request>
  let mockRes: {
    json: ReturnType<typeof jest.fn>
    status: ReturnType<typeof jest.fn>
  }
  let mockNext: NextFunction

  beforeEach(async () => {
    controller = await import('../cache.controller.js')

    mockReq = {}
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
    jest.clearAllMocks()
  })

  describe('invalidateProductCache', () => {
    it('should clear all product cache keys', async () => {
      mockRedis.keys.mockResolvedValue(['products:all', 'products:1', 'products:category:Electronics'])
      mockRedis.del.mockResolvedValue(3)

      await controller.invalidateProductCache(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockRedis.keys).toHaveBeenCalledWith('products:*')
      expect(mockRedis.del).toHaveBeenCalledWith(
        'products:all',
        'products:1',
        'products:category:Electronics'
      )
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product cache invalidated',
      })
    })

    it('should succeed even when no cache keys exist', async () => {
      mockRedis.keys.mockResolvedValue([])

      await controller.invalidateProductCache(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockRedis.keys).toHaveBeenCalledWith('products:*')
      expect(mockRedis.del).not.toHaveBeenCalled()
      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product cache invalidated',
      })
    })

    it('should call next on Redis error', async () => {
      const error = new Error('Redis connection failed')
      mockRedis.keys.mockRejectedValue(error)

      await controller.invalidateProductCache(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })
})
