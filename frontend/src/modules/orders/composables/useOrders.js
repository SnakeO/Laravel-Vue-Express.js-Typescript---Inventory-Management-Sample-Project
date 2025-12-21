/**
 * Orders composable - handles order API logic
 */
import { ref } from 'vue'
import { api } from '@/shared/composables/useApi'
import { useAppStore } from '@/shared/stores/app'

export function useOrders () {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)

  const appStore = useAppStore()

  async function fetchOrders () {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/orders')
      orders.value = response.data.data
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
    fetchOrders,
    createOrder,
    deleteOrder,
  }
}
