import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import type { Request, Response, NextFunction } from 'express'

// Mock Laravel client at boundary
const mockLaravelClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}

jest.unstable_mockModule('#common/services/laravel.js', () => ({
  laravelClient: mockLaravelClient,
}))

describe('Orders Controller', () => {
  let controller: typeof import('../orders.controller.js')
  let mockReq: Partial<Request>
  let mockRes: {
    json: ReturnType<typeof jest.fn>
    status: ReturnType<typeof jest.fn>
    send: ReturnType<typeof jest.fn>
  }
  let mockNext: NextFunction

  beforeEach(async () => {
    controller = await import('../orders.controller.js')

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
    it('should return orders with product cost stripped', async () => {
      // Laravel returns orders with nested product including cost
      mockLaravelClient.get.mockResolvedValue({
        data: {
          data: [
            {
              id: 1,
              product_id: 1,
              quantity: 5,
              product: {
                id: 1,
                name: 'Widget',
                description: 'A widget',
                category: 'Electronics',
                price: 29.99,
                cost: 15.0,
                quantity: 95,
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-15T10:30:00Z',
              },
              created_at: '2024-01-15T11:00:00Z',
              updated_at: '2024-01-15T11:00:00Z',
            },
          ],
        },
      })

      await controller.list(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      // Assert: nested product.cost is stripped
      expect(mockRes.json).toHaveBeenCalledWith({
        data: [
          {
            id: 1,
            product_id: 1,
            quantity: 5,
            product: {
              id: 1,
              name: 'Widget',
              description: 'A widget',
              category: 'Electronics',
              price: 29.99,
              quantity: 95,
              created_at: '2024-01-15T10:30:00Z',
              updated_at: '2024-01-15T10:30:00Z',
            },
            created_at: '2024-01-15T11:00:00Z',
            updated_at: '2024-01-15T11:00:00Z',
          },
        ],
      })
    })

    it('should call next on error', async () => {
      const error = new Error('Laravel error')
      mockLaravelClient.get.mockRejectedValue(error)

      await controller.list(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockNext).toHaveBeenCalledWith(error)
    })
  })

  describe('show', () => {
    it('should return a single order with product cost stripped', async () => {
      mockReq.params = { id: '1' }
      mockLaravelClient.get.mockResolvedValue({
        data: {
          data: {
            id: 1,
            product_id: 1,
            quantity: 5,
            product: {
              id: 1,
              name: 'Widget',
              cost: 15.0,
              price: 29.99,
            },
            created_at: '2024-01-15T11:00:00Z',
            updated_at: '2024-01-15T11:00:00Z',
          },
        },
      })

      await controller.show(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockLaravelClient.get).toHaveBeenCalledWith('/orders/1')
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          id: 1,
          product_id: 1,
          quantity: 5,
          product: {
            id: 1,
            name: 'Widget',
            price: 29.99,
          },
          created_at: '2024-01-15T11:00:00Z',
          updated_at: '2024-01-15T11:00:00Z',
        },
      })
    })
  })

  describe('create', () => {
    it('should create order via Laravel and return 201', async () => {
      mockReq.body = {
        product_id: 1,
        quantity: 10,
      }
      mockLaravelClient.post.mockResolvedValue({
        data: {
          data: {
            id: 1,
            product_id: 1,
            quantity: 10,
            created_at: '2024-01-15T11:00:00Z',
            updated_at: '2024-01-15T11:00:00Z',
          },
        },
      })

      await controller.create(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockLaravelClient.post).toHaveBeenCalledWith('/orders', {
        product_id: 1,
        quantity: 10,
      })
      expect(mockRes.status).toHaveBeenCalledWith(201)
      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          id: 1,
          product_id: 1,
          quantity: 10,
          created_at: '2024-01-15T11:00:00Z',
          updated_at: '2024-01-15T11:00:00Z',
        },
      })
    })
  })

  describe('destroy', () => {
    it('should delete order via Laravel and return 204', async () => {
      mockReq.params = { id: '1' }
      mockLaravelClient.delete.mockResolvedValue({})

      await controller.destroy(
        mockReq as Request,
        mockRes as unknown as Response,
        mockNext
      )

      expect(mockLaravelClient.delete).toHaveBeenCalledWith('/orders/1')
      expect(mockRes.status).toHaveBeenCalledWith(204)
      expect(mockRes.send).toHaveBeenCalled()
    })
  })
})
