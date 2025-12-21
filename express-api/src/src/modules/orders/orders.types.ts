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

export interface OrderFilters {
  page?: number
  per_page?: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedOrders {
  data: Order[]
  meta: PaginationMeta
}
