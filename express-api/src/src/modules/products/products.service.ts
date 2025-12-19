/**
 * Products service - business logic, Redis caching, Laravel API calls
 */
import { redis } from '#common/services/redis.js'
import { laravelClient } from '#common/services/laravel.js'
import { redisConfig } from '#config/index.js'
import type { Product, ProductWithoutCost, ProductFilters } from './products.types.js'
import { stripCost, stripCostFromList } from './products.types.js'
import type { ApiResponse, PaginatedResponse } from '#common/types/api.js'

const CACHE_PREFIX = 'products'

export const buildCacheKey = (filters: ProductFilters): string => {
  const parts = [CACHE_PREFIX]

  if (filters.category) {
    parts.push(`category:${filters.category}`)
  }
  if (filters.name) {
    parts.push(`name:${filters.name}`)
  }

  return parts.length === 1 ? `${CACHE_PREFIX}:all` : parts.join(':')
}

export const getFromCache = async (
  key: string
): Promise<ProductWithoutCost[] | null> => {
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached) as ProductWithoutCost[]
  }
  return null
}

export const setCache = async (
  key: string,
  products: ProductWithoutCost[]
): Promise<void> => {
  await redis.set(key, JSON.stringify(products), 'EX', redisConfig.cacheTtl)
}

export const invalidateAllProductCache = async (): Promise<void> => {
  const keys = await redis.keys(`${CACHE_PREFIX}:*`)
  if (keys.length > 0) {
    await redis.del(...keys)
    console.log(`Invalidated ${keys.length} product cache keys`)
  }
}

export const getProducts = async (
  filters: ProductFilters
): Promise<ProductWithoutCost[]> => {
  const cacheKey = buildCacheKey(filters)

  // Check cache first
  const cached = await getFromCache(cacheKey)
  if (cached) {
    console.log(`Cache hit for ${cacheKey}`)
    return cached
  }

  console.log(`Cache miss for ${cacheKey}`)

  // Build query params
  const params = new URLSearchParams()
  if (filters.category) {
     params.append('category', filters.category)
  }

  if (filters.name) {
      params.append('name', filters.name)
  }

  const response = await laravelClient.get<PaginatedResponse<Product>>(
    `/products?${params}`
  )

  const products = stripCostFromList(response.data.data)

  // Cache the result
  await setCache(cacheKey, products)

  return products
}

export const getProduct = async (id: number): Promise<ProductWithoutCost> => {
  const cacheKey = `${CACHE_PREFIX}:${id}`

  const cached = await redis.get(cacheKey)
  if (cached) {
    console.log(`Cache hit for ${cacheKey}`)
    return JSON.parse(cached) as ProductWithoutCost
  }

  console.log(`Cache miss for ${cacheKey}`)

  const response = await laravelClient.get<ApiResponse<Product>>(
    `/products/${id}`
  )
  const product = stripCost(response.data.data)

  await redis.set(cacheKey, JSON.stringify(product), 'EX', redisConfig.cacheTtl)

  return product
}

export const createProduct = async (
  data: Partial<Product>
): Promise<ProductWithoutCost> => {
  const response = await laravelClient.post<ApiResponse<Product>>(
    '/products',
    data
  )
  return stripCost(response.data.data)
}

export const updateProduct = async (
  id: number,
  data: Partial<Product>
): Promise<ProductWithoutCost> => {
  const response = await laravelClient.put<ApiResponse<Product>>(
    `/products/${id}`,
    data
  )
  return stripCost(response.data.data)
}

export const deleteProduct = async (id: number): Promise<void> => {
  await laravelClient.delete(`/products/${id}`)
}
