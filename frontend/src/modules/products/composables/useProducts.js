/**
 * Products composable - handles product API logic
 */
import { ref } from 'vue'
import { api, cleanParams } from '@/shared/composables/useApi'
import { useAppStore } from '@/shared/stores/app'

export function useProducts () {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  const appStore = useAppStore()

  async function fetchProducts (filters = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/products', { params: cleanParams(filters) })
      products.value = response.data.data
    } catch (error_) {
      const msg = error_.message
      error.value = msg
      appStore.showError(msg)
    } finally {
      loading.value = false
    }
  }

  async function createProduct (productData) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/products', productData)
      products.value.push(response.data.data)
      appStore.showSuccess('Product created successfully')
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

  async function deleteProduct (id) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/products/${id}`)
      products.value = products.value.filter(p => p.id !== id)
      appStore.showSuccess('Product deleted successfully')
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
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    deleteProduct,
  }
}
