/**
 * API composable - axios instance configured for Express API
 * Includes auth interceptors for auto-attaching tokens and handling refresh
 */
import axios from 'axios'
import { accessToken, refresh, clearAuthState } from './useAuth.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach access token to all requests
api.interceptors.request.use(config => {
  if (accessToken.value) {
    config.headers.Authorization = `Bearer ${accessToken.value}`
  }
  return config
})

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue = []

function processQueue (error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Response interceptor - handle 401 errors with token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const data = error.response?.data

    // Check if this is an expired token error
    if (error.response?.status === 401 && data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await refresh()
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuthState()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Extract detailed validation errors if present
    const message = data?.details?.length
      ? data.details.map(d => d.message).join(', ')
      : data?.message || error.message || 'An error occurred'

    return Promise.reject({ message, status: error.response?.status, code: data?.code })
  },
)

/**
 * Removes empty/null/undefined values from an object (for query params)
 */
function cleanParams (obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v))
}

export { api, cleanParams }
