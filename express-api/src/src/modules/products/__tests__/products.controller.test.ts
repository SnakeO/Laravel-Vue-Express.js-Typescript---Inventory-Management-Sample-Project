import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'

// Mock Redis at boundary
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(),
  on: vi.fn(),
}

// Mock Laravel client at boundary
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
    json: ReturnType<typeof vi.fn>
    status: ReturnType<typeof vi.fn>
    send: ReturnType<typeof vi.fn>
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
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    }
    mockNext = vi.fn()
    vi.clearAllMocks()
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
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 1,
          },
        },
      })

      await controller.list(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      // Assert: response has no cost (stripCost ran) and includes meta
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
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 1,
        },
      })
      expect(mockRedis.set).toHaveBeenCalled()
    })

    it('should return cached products on cache hit', async () => {
      const cachedResult = {
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
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 1,
        },
      }
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedResult))

      await controller.list(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockLaravelClient.get).not.toHaveBeenCalled()
      expect(mockRes.json).toHaveBeenCalledWith(cachedResult)
    })

    it('should pass filters to Laravel API', async () => {
      mockReq.query = { category: 'Electronics', name: 'Widget' }
      mockRedis.get.mockResolvedValue(null)
      mockLaravelClient.get.mockResolvedValue({
        data: {
          data: [],
          meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
        },
      })

      await controller.list(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockLaravelClient.get).toHaveBeenCalledWith(
        '/products',
        { params: { category: 'Electronics', name: 'Widget' } }
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
