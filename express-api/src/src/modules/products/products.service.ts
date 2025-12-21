/**
 * Products service - business logic, Redis caching, Laravel API calls
 */
import { redis } from '#common/services/redis.js'
import { laravelClient } from '#common/services/laravel.js'
import { redisConfig } from '#config/index.js'
import type { Product, ProductWithoutCost, ProductFilters, PaginatedProducts, PaginationMeta } from './products.types.js'
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

  const page = filters.page ?? 1
  const perPage = filters.per_page ?? 20
  parts.push(`page:${page}:${perPage}`)

  return parts.join(':')
}

export const getFromCache = async (
  key: string
): Promise<PaginatedProducts | null> => {
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached) as PaginatedProducts
  }
  return null
}

export const setCache = async (
  key: string,
  result: PaginatedProducts
): Promise<void> => {
  await redis.set(key, JSON.stringify(result), 'EX', redisConfig.cacheTtl)
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
): Promise<PaginatedProducts> => {
  const cacheKey = buildCacheKey(filters)

  // Check cache first
  const cached = await getFromCache(cacheKey)
  if (cached) {
    console.log(`Cache hit for ${cacheKey}`)
    return cached
  }

  console.log(`Cache miss for ${cacheKey}`)

  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v != null)
  )

  const response = await laravelClient.get<PaginatedResponse<Product>>(
    '/products',
    { params }
  )

  const result: PaginatedProducts = {
    data: stripCostFromList(response.data.data),
    meta: {
      current_page: response.data.meta.current_page,
      last_page: response.data.meta.last_page,
      per_page: response.data.meta.per_page,
      total: response.data.meta.total,
    },
  }

  // Cache the result
  await setCache(cacheKey, result)

  return result
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
