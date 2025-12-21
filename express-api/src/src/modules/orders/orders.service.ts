/**
 * Orders service - business logic, Laravel API calls, strips cost from nested products
 */
import { laravelClient } from '#common/services/laravel.js'
import type { Order, CreateOrderDto, OrderFilters, PaginatedOrders } from './orders.types.js'
import type { ApiResponse, PaginatedResponse } from '#common/types/api.js'
import { stripCost } from '#modules/products/index.js'
import type { Product } from '#modules/products/index.js'

// Transform order to strip cost from nested product
const transformOrder = (order: Order & { product?: Product }): Order => {
  if (order.product) {
    return {
      ...order,
      product: stripCost(order.product as Product),
    }
  }
  return order
}

export const getOrders = async (filters: OrderFilters = {}): Promise<PaginatedOrders> => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v != null)
  )

  const response =
    await laravelClient.get<PaginatedResponse<Order & { product?: Product }>>(
      '/orders',
      { params }
    )

  return {
    data: response.data.data.map(transformOrder),
    meta: {
      current_page: response.data.meta.current_page,
      last_page: response.data.meta.last_page,
      per_page: response.data.meta.per_page,
      total: response.data.meta.total,
    },
  }
}

export const getOrder = async (id: number): Promise<Order> => {
  const response = await laravelClient.get<
    ApiResponse<Order & { product?: Product }>
  >(`/orders/${id}`)
  return transformOrder(response.data.data)
}

export const createOrder = async (data: CreateOrderDto): Promise<Order> => {
  const response = await laravelClient.post<
    ApiResponse<Order & { product?: Product }>
  >('/orders', data)
  return transformOrder(response.data.data)
}

export const deleteOrder = async (id: number): Promise<void> => {
  await laravelClient.delete(`/orders/${id}`)
}
