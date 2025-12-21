/**
 * Orders composable - handles order API logic
 */
import { ref } from 'vue'
import { api, cleanParams } from '@/shared/composables/useApi'
import { useAppStore } from '@/shared/stores/app'

export function useOrders () {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalItems = ref(0)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const itemsPerPage = ref(20)

  const appStore = useAppStore()

  async function fetchOrders (filters = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/orders', { params: cleanParams(filters) })
      orders.value = response.data.data
      if (response.data.meta) {
        totalItems.value = response.data.meta.total
        currentPage.value = response.data.meta.current_page
        lastPage.value = response.data.meta.last_page
        itemsPerPage.value = response.data.meta.per_page
      }
    } catch (error_) {
      const msg = error_.message
      error.value = msg
      appStore.showError(msg)
    } finally {
      loading.value = false
    }
  }

  async function createOrder (orderData) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/orders', orderData)
      orders.value.push(response.data.data)
      appStore.showSuccess('Order created successfully')
      return response.data.data
    } catch (error_) {
      const msg = error_.message
      error.value = msg
      appStore.showError(msg)
      throw error_
    } finally {
      loading.value = false
    }
  }

  async function deleteOrder (id) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/orders/${id}`)
      orders.value = orders.value.filter(o => o.id !== id)
      appStore.showSuccess('Order deleted successfully')
    } catch (error_) {
      const msg = error_.message
      error.value = msg
      appStore.showError(msg)
      throw error_
    } finally {
      loading.value = false
    }
  }

  return {
    orders,
    loading,
    error,
    totalItems,
    currentPage,
    lastPage,
    itemsPerPage,
    fetchOrders,
    createOrder,
    deleteOrder,
  }
}
