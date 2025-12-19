/**
 * TypeScript interfaces for orders
 */
import type { ProductWithoutCost } from '../products/index.js'

export interface Order {
  id: number
  product_id: number
  quantity: number
  product?: ProductWithoutCost
  created_at: string
  updated_at: string
}

export interface CreateOrderDto {
  product_id: number
  quantity: number
}
