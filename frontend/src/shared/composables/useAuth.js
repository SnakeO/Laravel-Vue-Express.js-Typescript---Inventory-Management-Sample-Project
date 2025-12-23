/**
 * Auth composable - handles authentication state, login, logout, refresh
 * Token refresh is handled reactively by axios interceptor on 401 responses
 */
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const accessToken = ref(localStorage.getItem('accessToken'))
const refreshToken = ref(localStorage.getItem('refreshToken'))
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

async function refresh () {
  if (!refreshToken.value) {
    throw new Error('No refresh token')
  }

  try {
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refreshToken: refreshToken.value,
    })

    const { accessToken: newAccessToken } = response.data.data
    accessToken.value = newAccessToken
    localStorage.setItem('accessToken', newAccessToken)

    return newAccessToken
  } catch (error) {
    clearAuthState()
    throw error
  }
}

function clearAuthState () {
  accessToken.value = null
  refreshToken.value = null
  user.value = null
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export function useAuth () {
  const isAuthenticated = computed(() => !!accessToken.value)

  async function login (email, password) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    })

    const { user: userData, tokens } = response.data.data

    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    user.value = userData

    localStorage.setItem('accessToken', tokens.accessToken)
    localStorage.setItem('refreshToken', tokens.refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))

    return userData
  }

  async function logout () {
    if (refreshToken.value) {
      try {
        await axios.post(`${API_URL}/auth/logout`, {
          refreshToken: refreshToken.value,
        })
      } catch {
        // Ignore errors during logout
      }
    }
    clearAuthState()
  }

  async function fetchCurrentUser () {
    if (!accessToken.value) return null

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      })
      user.value = response.data.data
      localStorage.setItem('user', JSON.stringify(user.value))
      return user.value
    } catch {
      return null
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    logout,
    refresh,
    fetchCurrentUser,
  }
}

// Export for use in axios interceptors
export { accessToken, refresh, clearAuthState }
