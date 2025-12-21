/**
 * Products composable - handles product API logic
 */
import { useCrud } from '@/shared/composables/useCrud'

export function useProducts () {
  const crud = useCrud('/products', 'Product')

  return {
    products: crud.items,
    loading: crud.loading,
    error: crud.error,
    totalItems: crud.totalItems,
    currentPage: crud.currentPage,
    lastPage: crud.lastPage,
    itemsPerPage: crud.itemsPerPage,
    fetchProducts: crud.fetchItems,
    createProduct: crud.createItem,
    deleteProduct: crud.deleteItem,
  }
}
