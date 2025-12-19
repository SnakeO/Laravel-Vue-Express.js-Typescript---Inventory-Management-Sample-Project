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

// Mock Laravel client at boundary
const mockLaravelClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}

jest.unstable_mockModule('#common/services/redis.js', () => ({
  redis: mockRedis,
}))

jest.unstable_mockModule('#common/services/laravel.js', () => ({
  laravelClient: mockLaravelClient,
}))

jest.unstable_mockModule('#config/index.js', () => ({
  redisConfig: {
    host: 'localhost',
    port: 6379,
    cacheTtl: 300,
  },
}))

describe('Products Controller', () => {
  let controller: typeof import('../products.controller.js')
  let mockReq: Partial<Request>
  let mockRes: {
    json: ReturnType<typeof jest.fn>
    status: ReturnType<typeof jest.fn>
    send: ReturnType<typeof jest.fn>
  }
  let mockNext: NextFunction

  beforeEach(async () => {
    controller = await import('../products.controller.js')

    mockReq = {
      query: {},
      params: {},
      body: {},
    }
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    }
    mockNext = jest.fn()
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('should fetch from Laravel on cache miss and strip cost', async () => {
      // Arrange: cache miss, API returns products WITH cost
      mockRedis.get.mockResolvedValue(null)
      mockLaravelClient.get.mockResolvedValue({
        data: {
          data: [
            {
              id: 1,
              name: 'Widget',
              description: 'A widget',
              category: 'Electronics',
              price: 29.99,
              cost: 15.0,
              quantity: 100,
              created_at: '2024-01-15T10:30:00Z',
              updated_at: '2024-01-15T10:30:00Z',
            },
          ],
        },
      })

      await controller.list(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      // Assert: response has no cost (stripCost ran)
      expect(mockRes.json).toHaveBeenCalledWith({
        data: [
          {
            id: 1,
            name: 'Widget',
            description: 'A widget',
            category: 'Electronics',
            price: 29.99,
            quantity: 100,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
          },
        ],
      })
      expect(mockRedis.set).toHaveBeenCalled()
    })

    it('should return cached products on cache hit', async () => {
      const cachedProducts = [
        {
          id: 1,
          name: 'Widget',
          description: 'A widget',
          category: 'Electronics',
          price: 29.99,
          quantity: 100,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
      ]
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedProducts))

      await controller.list(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockLaravelClient.get).not.toHaveBeenCalled()
      expect(mockRes.json).toHaveBeenCalledWith({ data: cachedProducts })
    })

    it('should pass filters to Laravel API', async () => {
      mockReq.query = { category: 'Electronics', name: 'Widget' }
      mockRedis.get.mockResolvedValue(null)
      mockLaravelClient.get.mockResolvedValue({
        data: { data: [] },
      })

      await controller.list(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockLaravelClient.get).toHaveBeenCalledWith(
        '/products?category=Electronics&name=Widget'
      )
    })

    it('should call next on error', async () => {
      const error = new Error('Redis error')
      mockRedis.get.mockRejectedValue(error)

      await controller.list(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })

  describe('show', () => {
    it('should fetch from Laravel on cache miss and strip cost', async () => {
      mockReq.params = { id: '1' }
      mockRedis.get.mockResolvedValue(null)
      mockLaravelClient.get.mockResolvedValue({
        data: {
          data: {
            id: 1,
            name: 'Widget',
            description: 'A widget',
            category: 'Electronics',
            price: 29.99,
            cost: 15.0,
            quantity: 100,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
          },
        },
      })

      await controller.show(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          id: 1,
          name: 'Widget',
          description: 'A widget',
          category: 'Electronics',
          price: 29.99,
          quantity: 100,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
      })
      expect(mockRedis.set).toHaveBeenCalled()
    })

    it('should return cached product on cache hit', async () => {
      mockReq.params = { id: '1' }
      const cachedProduct = {
        id: 1,
        name: 'Widget',
        price: 29.99,
        quantity: 100,
      }
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedProduct))

      await controller.show(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockLaravelClient.get).not.toHaveBeenCalled()
      expect(mockRes.json).toHaveBeenCalledWith({ data: cachedProduct })
    })
  })

  describe('create', () => {
    it('should create product via Laravel and strip cost from response', async () => {
      mockReq.body = {
        name: 'New Widget',
        category: 'Electronics',
        price: 19.99,
        cost: 10.0,
        quantity: 50,
      }
      mockLaravelClient.post.mockResolvedValue({
        data: {
          data: {
            id: 1,
            name: 'New Widget',
            description: null,
            category: 'Electronics',
            price: 19.99,
            cost: 10.0,
            quantity: 50,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z',
          },
        },
      })

      await controller.create(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          id: 1,
          name: 'New Widget',
          description: null,
          category: 'Electronics',
          price: 19.99,
          quantity: 50,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
        },
      })
    })
  })

  describe('destroy', () => {
    it('should delete product via Laravel and return 204', async () => {
      mockReq.params = { id: '1' }
      mockLaravelClient.delete.mockResolvedValue({})

      await controller.destroy(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockLaravelClient.delete).toHaveBeenCalledWith('/products/1')
      expect(mockRes.status).toHaveBeenCalledWith(204)
      expect(mockRes.send).toHaveBeenCalled()
    })
  })
})
