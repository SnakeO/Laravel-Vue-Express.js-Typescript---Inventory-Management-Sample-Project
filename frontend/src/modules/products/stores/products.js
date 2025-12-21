/**
 * Products store - filter and sort state persistence
 */
import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    filters: {
      name: '',
      category: '',
    },
    sortBy: [{ key: 'name', order: 'asc' }],
  }),

  actions: {
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    clearFilters() {
      this.filters = { name: '', category: '' }
    },

    setSortBy(sortBy) {
      this.sortBy = sortBy
    },
  },
})
