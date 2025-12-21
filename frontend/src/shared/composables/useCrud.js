/**
 * Generic CRUD composable factory with pagination support
 */
import { ref } from 'vue'
import { api, cleanParams } from '@/shared/composables/useApi'
import { useAppStore } from '@/shared/stores/app'

export function useCrud (endpoint, entityName) {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalItems = ref(0)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const itemsPerPage = ref(20)

  const appStore = useAppStore()

  async function fetchItems (filters = {}) {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(endpoint, { params: cleanParams(filters) })
      items.value = response.data.data
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

  async function createItem (data) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post(endpoint, data)
      items.value.push(response.data.data)
      appStore.showSuccess(`${entityName} created successfully`)
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

  async function deleteItem (id) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`${endpoint}/${id}`)
      items.value = items.value.filter(item => item.id !== id)
      appStore.showSuccess(`${entityName} deleted successfully`)
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
    items,
    loading,
    error,
    totalItems,
    currentPage,
    lastPage,
    itemsPerPage,
    fetchItems,
    createItem,
    deleteItem,
  }
}
