/**
 * Tests for useAuth composable
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('useAuth', () => {
  let useAuth

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()

    // Re-import to get fresh state
    const module = await import('@/shared/composables/useAuth.js')
    useAuth = module.useAuth
  })

  describe('initial state', () => {
    it('should start unauthenticated when no tokens in storage', () => {
      const { isAuthenticated, user } = useAuth()
      expect(isAuthenticated.value).toBe(false)
      expect(user.value).toBe(null)
    })

    it('should restore auth state from localStorage', async () => {
      localStorage.setItem('accessToken', 'stored-token')
      localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test' }))

      vi.resetModules()
      const module = await import('@/shared/composables/useAuth.js')
      const { isAuthenticated, user } = module.useAuth()

      expect(isAuthenticated.value).toBe(true)
      expect(user.value).toEqual({ id: 1, name: 'Test' })
    })
  })

  describe('login', () => {
    it('should set tokens and user on successful login', async () => {
      const mockResponse = {
        data: {
          data: {
            user: { id: 1, name: 'Test User', email: 'test@example.com' },
            tokens: {
              accessToken: 'access-token-123',
              refreshToken: 'refresh-token-456',
            },
          },
        },
      }

      axios.post.mockResolvedValueOnce(mockResponse)

      const { login, isAuthenticated, user, accessToken } = useAuth()
      const result = await login('test@example.com', 'password123')

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        { email: 'test@example.com', password: 'password123' }
      )
      expect(isAuthenticated.value).toBe(true)
      expect(user.value).toEqual(mockResponse.data.data.user)
      expect(accessToken.value).toBe('access-token-123')
      expect(result).toEqual(mockResponse.data.data.user)
    })

    it('should store tokens in localStorage', async () => {
      const mockResponse = {
        data: {
          data: {
            user: { id: 1, name: 'Test' },
            tokens: { accessToken: 'at', refreshToken: 'rt' },
          },
        },
      }

      axios.post.mockResolvedValueOnce(mockResponse)

      const { login } = useAuth()
      await login('test@example.com', 'password')

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'at')
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'rt')
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ id: 1, name: 'Test' }))
    })

    it('should propagate login errors', async () => {
      axios.post.mockRejectedValueOnce(new Error('Invalid credentials'))

      const { login } = useAuth()
      await expect(login('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should clear auth state on logout', async () => {
      // First login
      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            user: { id: 1 },
            tokens: { accessToken: 'at', refreshToken: 'rt' },
          },
        },
      })

      const { login, logout, isAuthenticated, user } = useAuth()
      await login('test@example.com', 'password')

      expect(isAuthenticated.value).toBe(true)

      // Mock logout call
      axios.post.mockResolvedValueOnce({})

      await logout()

      expect(isAuthenticated.value).toBe(false)
      expect(user.value).toBe(null)
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken')
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken')
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('should clear auth state even if logout API fails', async () => {
      // First login
      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            user: { id: 1 },
            tokens: { accessToken: 'at', refreshToken: 'rt' },
          },
        },
      })

      const { login, logout, isAuthenticated } = useAuth()
      await login('test@example.com', 'password')

      // Mock logout call to fail
      axios.post.mockRejectedValueOnce(new Error('Network error'))

      await logout()

      expect(isAuthenticated.value).toBe(false)
    })
  })

  describe('refresh', () => {
    it('should update access token on refresh', async () => {
      // Setup initial state with refresh token
      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            user: { id: 1 },
            tokens: { accessToken: 'old-at', refreshToken: 'rt' },
          },
        },
      })

      const { login, refresh, accessToken } = useAuth()
      await login('test@example.com', 'password')

      // Mock refresh call
      axios.post.mockResolvedValueOnce({
        data: {
          data: { accessToken: 'new-access-token' },
        },
      })

      const newToken = await refresh()

      expect(newToken).toBe('new-access-token')
      expect(accessToken.value).toBe('new-access-token')
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token')
    })
  })

  describe('fetchCurrentUser', () => {
    it('should return null when not authenticated', async () => {
      const { fetchCurrentUser } = useAuth()
      const result = await fetchCurrentUser()
      expect(result).toBe(null)
    })

    it('should fetch and update user when authenticated', async () => {
      // Login first
      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            user: { id: 1, name: 'Old Name' },
            tokens: { accessToken: 'at', refreshToken: 'rt' },
          },
        },
      })

      const { login, fetchCurrentUser, user } = useAuth()
      await login('test@example.com', 'password')

      // Mock fetchCurrentUser call
      axios.get.mockResolvedValueOnce({
        data: {
          data: { id: 1, name: 'New Name', email: 'test@example.com' },
        },
      })

      const result = await fetchCurrentUser()

      expect(result).toEqual({ id: 1, name: 'New Name', email: 'test@example.com' })
      expect(user.value).toEqual(result)
    })
  })
})
