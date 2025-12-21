export interface Product {
  id: number
  name: string
  description: string | null
  category: string
  price: number
  cost: number
  quantity: number
  created_at: string
  updated_at: string
}

export type ProductWithoutCost = Omit<Product, 'cost'>

export interface ProductFilters {
  category?: string
  name?: string
  page?: number
  per_page?: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface PaginatedProducts {
  data: ProductWithoutCost[]
  meta: PaginationMeta
}

/**
 * Type transformation utilities are placed here rather than in the service because:
 *
 * - Tight coupling with types - These transform Product → ProductWithoutCost
 * - Dependency-free reuse - Other modules (e.g., orders) can import these without
 *    pulling in Redis/HTTP client dependencies that live in the service layer
 * - Isolated testability - Can be unit tested without mocking infrastructure
 */
export const stripCost = (product: Product): ProductWithoutCost => {
  const { cost: _, ...rest } = product
  return rest
}

export const stripCostFromList = (products: Product[]): ProductWithoutCost[] => {
  return products.map(stripCost)
}
