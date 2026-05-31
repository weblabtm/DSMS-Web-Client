import { create } from 'zustand'
import * as authApi from '../api/authApi'

const STORAGE_KEY = 'dsms_session'

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  /**
   * Set general loading/error status
   */
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  /**
   * Initialize store: Restore session from localStorage and refresh the token
   */
  initStore: async () => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY)
      if (savedSession) {
        const parsed = JSON.parse(savedSession)
        if (parsed && parsed.refreshToken) {
          // Temporarily set the session from localStorage to get started
          set({
            user: parsed,
            isAuthenticated: true,
            isInitialized: false,
          })

          // Refresh the token in the background to ensure session is active
          try {
            await get().refreshToken()
          } catch (refreshErr) {
            console.warn('Failed to refresh session on initialization:', refreshErr.message)
            // If the refresh fails due to unauthorized, logout will have been called inside refreshToken
          }
        }
      }
    } catch (err) {
      console.error('Error during auth storage rehydration:', err)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      set({ isInitialized: true })
    }
  },

  /**
   * Log in with identifier and password
   */
  login: async ({ identifier, password, tenantId, branchId }) => {
    set({ isLoading: true, error: null })
    try {
      const session = await authApi.login({ identifier, password, tenantId, branchId })
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      set({
        user: session,
        isAuthenticated: true,
        isLoading: false,
      })
      return session
    } catch (err) {
      const message = err.message || 'An error occurred during sign in'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * Register a new user
   */
  register: async ({ identifier, password, role, tenantId, branchId }, inviterToken = null) => {
    set({ isLoading: true, error: null })
    try {
      const session = await authApi.register(
        { identifier, password, role, tenantId, branchId },
        inviterToken
      )

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      set({
        user: session,
        isAuthenticated: true,
        isLoading: false,
      })
      return session
    } catch (err) {
      const message = err.message || 'An error occurred during registration'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * Rotate access and refresh tokens
   */
  refreshToken: async () => {
    const { user } = get()
    if (!user || !user.refreshToken) return

    try {
      const newSession = await authApi.refreshSession(user.refreshToken)
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
      set({
        user: newSession,
        isAuthenticated: true,
      })
      return newSession
    } catch (err) {
      console.error('Token refresh failed:', err)
      
      // If refresh failed due to token expiration or invalidity (401/403/400), log out
      if (err.status === 400 || err.status === 401 || err.status === 403) {
        get().logout()
      }
      throw err
    }
  },

  /**
   * Log out of the current session
   */
  logout: async () => {
    const { user } = get()
    const refreshToken = user?.refreshToken

    // Local cleanup first (immediate responsiveness)
    localStorage.removeItem(STORAGE_KEY)
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    })

    // Background server call to invalidate refresh token
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch (err) {
        console.warn('Logout endpoint call failed:', err)
      }
    }
  },
}))
