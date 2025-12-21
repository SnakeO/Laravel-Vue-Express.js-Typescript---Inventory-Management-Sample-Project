/**
 * Global app store - notification state
 */
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    snackbar: {
      show: false,
      message: '',
      color: 'success',
      timeout: 3000,
    },
  }),

  actions: {
    showSuccess(message) {
      this.snackbar = {
        show: true,
        message,
        color: 'success',
        timeout: 3000,
      }
    },

    showError(message) {
      this.snackbar = {
        show: true,
        message,
        color: 'error',
        timeout: 5000,
      }
    },

    hideSnackbar() {
      this.snackbar.show = false
    },
  },
})
