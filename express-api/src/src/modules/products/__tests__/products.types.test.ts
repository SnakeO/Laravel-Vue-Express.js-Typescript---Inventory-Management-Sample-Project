import { describe, it, expect } from '@jest/globals'
import { stripCost, stripCostFromList } from '../products.types.js'
import type { Product } from '../products.types.js'

describe('Product Types', () => {
  describe('stripCost', () => {
    it('should remove cost and preserve all other fields', () => {
      const product: Product = {
        id: 1,
        name: 'Widget',
        description: 'A widget',
        category: 'Electronics',
        price: 29.99,
        cost: 15.0,
        quantity: 100,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      }

      expect(stripCost(product)).toEqual({
        id: 1,
        name: 'Widget',
        description: 'A widget',
        category: 'Electronics',
        price: 29.99,
        quantity: 100,
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
      })
    })
  })

  describe('stripCostFromList', () => {
    it('should remove cost field from all products', () => {
      const products: Product[] = [
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
        {
          id: 2,
          name: 'Gadget',
          description: null,
          category: 'Tools',
          price: 49.99,
          cost: 25.0,
          quantity: 50,
          created_at: '2024-01-16T11:30:00Z',
          updated_at: '2024-01-16T11:30:00Z',
        },
      ]

      const result = stripCostFromList(products)

      expect(result).toHaveLength(2)
      result.forEach((product) => {
        expect(product).not.toHaveProperty('cost')
      })
    })

    it('should return empty array for empty input', () => {
      const result = stripCostFromList([])
      expect(result).toEqual([])
    })
  })
})
