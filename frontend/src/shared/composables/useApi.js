/**
 * API composable - axios instance configured for Express API
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  response => response,
  error => {
    const data = error.response?.data
    let message

    // Extract detailed validation errors if present
    message = data?.details?.length ? data.details.map(d => d.message).join(', ') : data?.message || error.message || 'An error occurred'

    return Promise.reject({ message, status: error.response?.status })
  },
)

export { api }
