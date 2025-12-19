/**
 * Axios client for Laravel backend API calls
 */
import axios, { AxiosError, type AxiosInstance } from 'axios'
import { laravelConfig } from '#config/index.js'
import type { ApiError } from '#common/types/api.js'

export const laravelClient: AxiosInstance = axios.create({
  baseURL: laravelConfig.apiUrl,
  timeout: laravelConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

laravelClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const { status, data } = error.response
      console.error(`Laravel API error [${status}]:`, data)
    } else if (error.request) {
      console.error('Laravel API no response:', error.message)
    } else {
      console.error('Laravel API request error:', error.message)
    }
    return Promise.reject(error)
  }
)
