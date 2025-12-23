/**
 * Tests for useCrud composable
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock useAppStore
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()

vi.mock('@/shared/stores/app', () => ({
  useAppStore: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}))

// Mock useApi
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
}

vi.mock('@/shared/composables/useApi', () => ({
  api: mockApi,
  cleanParams: obj => Object.fromEntries(Object.entries(obj).filter(([, v]) => v)),
}))

describe('useCrud', () => {
  let useCrud

  beforeEach(async () => {
    vi.clearAllMocks()
    const module = await import('@/shared/composables/useCrud.js')
    useCrud = module.useCrud
  })

  describe('initial state', () => {
    it('should initialize with empty items and default pagination', () => {
      const crud = useCrud('/products', 'Product')

      expect(crud.items.value).toEqual([])
      expect(crud.loading.value).toBe(false)
      expect(crud.error.value).toBe(null)
      expect(crud.totalItems.value).toBe(0)
      expect(crud.currentPage.value).toBe(1)
      expect(crud.itemsPerPage.value).toBe(20)
    })
  })

  describe('fetchItems', () => {
    it('should fetch items and update state', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1' },
        { id: 2, name: 'Product 2' },
      ]

      mockApi.get.mockResolvedValueOnce({
        data: {
          data: mockProducts,
          meta: {
            total: 50,
            current_page: 1,
            last_page: 3,
            per_page: 20,
          },
        },
      })

      const { fetchItems, items, totalItems, currentPage } = useCrud('/products', 'Product')
      await fetchItems()

      expect(mockApi.get).toHaveBeenCalledWith('/products', { params: {} })
      expect(items.value).toEqual(mockProducts)
      expect(totalItems.value).toBe(50)
      expect(currentPage.value).toBe(1)
    })

    it('should pass filters to API', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: { data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 20 } },
      })

      const { fetchItems } = useCrud('/products', 'Product')
      await fetchItems({ category: 'Electronics', page: 2 })

      expect(mockApi.get).toHaveBeenCalledWith('/products', {
        params: { category: 'Electronics', page: 2 },
      })
    })

    it('should set loading state during fetch', async () => {
      let resolvePromise
      mockApi.get.mockReturnValueOnce(
        new Promise(resolve => {
          resolvePromise = resolve
        })
      )

      const { fetchItems, loading } = useCrud('/products', 'Product')
      const fetchPromise = fetchItems()

      expect(loading.value).toBe(true)

      resolvePromise({
        data: { data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: 20 } },
      })
      await fetchPromise

      expect(loading.value).toBe(false)
    })

    it('should handle fetch errors', async () => {
      mockApi.get.mockRejectedValueOnce({ message: 'Network error' })

      const { fetchItems, error, items } = useCrud('/products', 'Product')
      await fetchItems()

      expect(error.value).toBe('Network error')
      expect(items.value).toEqual([])
      expect(mockShowError).toHaveBeenCalledWith('Network error')
    })
  })

  describe('createItem', () => {
    it('should create item and add to list', async () => {
      const newProduct = { id: 3, name: 'New Product' }

      mockApi.post.mockResolvedValueOnce({
        data: { data: newProduct },
      })

      const { createItem, items } = useCrud('/products', 'Product')
      const result = await createItem({ name: 'New Product' })

      expect(mockApi.post).toHaveBeenCalledWith('/products', { name: 'New Product' })
      expect(result).toEqual(newProduct)
      expect(items.value).toContainEqual(newProduct)
      expect(mockShowSuccess).toHaveBeenCalledWith('Product created successfully')
    })

    it('should handle create errors', async () => {
      mockApi.post.mockRejectedValueOnce({ message: 'Validation error' })

      const { createItem, error } = useCrud('/products', 'Product')

      await expect(createItem({ name: '' })).rejects.toEqual({ message: 'Validation error' })
      expect(error.value).toBe('Validation error')
      expect(mockShowError).toHaveBeenCalledWith('Validation error')
    })
  })

  describe('deleteItem', () => {
    it('should delete item and remove from list', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          data: [
            { id: 1, name: 'Product 1' },
            { id: 2, name: 'Product 2' },
          ],
          meta: { total: 2, current_page: 1, last_page: 1, per_page: 20 },
        },
      })

      mockApi.delete.mockResolvedValueOnce({})

      const { fetchItems, deleteItem, items } = useCrud('/products', 'Product')

      await fetchItems()
      expect(items.value).toHaveLength(2)

      await deleteItem(1)

      expect(mockApi.delete).toHaveBeenCalledWith('/products/1')
      expect(items.value).toHaveLength(1)
      expect(items.value[0].id).toBe(2)
      expect(mockShowSuccess).toHaveBeenCalledWith('Product deleted successfully')
    })

    it('should handle delete errors', async () => {
      mockApi.delete.mockRejectedValueOnce({ message: 'Cannot delete' })

      const { deleteItem, error } = useCrud('/products', 'Product')

      await expect(deleteItem(1)).rejects.toEqual({ message: 'Cannot delete' })
      expect(error.value).toBe('Cannot delete')
      expect(mockShowError).toHaveBeenCalledWith('Cannot delete')
    })
  })
})
