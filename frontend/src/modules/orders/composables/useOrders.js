/**
 * Orders composable - handles order API logic
 */
import { useCrud } from '@/shared/composables/useCrud'

export function useOrders () {
  const crud = useCrud('/orders', 'Order')

  return {
    orders: crud.items,
    loading: crud.loading,
    error: crud.error,
    totalItems: crud.totalItems,
    currentPage: crud.currentPage,
    lastPage: crud.lastPage,
    itemsPerPage: crud.itemsPerPage,
    fetchOrders: crud.fetchItems,
    createOrder: crud.createItem,
    deleteOrder: crud.deleteItem,
  }
}
