/**
 * Orders store - sort state persistence
 */
import { defineStore } from 'pinia'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    sortBy: [{ key: 'created_at', order: 'desc' }],
  }),

  actions: {
    setSortBy (sortBy) {
      this.sortBy = sortBy
    },
  },
})
