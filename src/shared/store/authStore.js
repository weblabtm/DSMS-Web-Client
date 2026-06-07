import { create } from 'zustand'
import * as authApi from '../api/authApi'
import { buildBaseHostUrl } from '../config/runtime-config'

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
   * Persist a session returned from auth APIs.
   */
  setSession: (session) => {
    const { refreshToken, ...safeSession } = session || {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSession))
    set({
      user: session,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
  },

  /**
   * Initialize store: Restore session from localStorage and refresh the token
   */
  initStore: async () => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY)
      if (savedSession) {
        const parsed = JSON.parse(savedSession)
        if (parsed && parsed.userId) {
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
  login: async ({ identifier, password, tenantId, branchId, rememberMe, mfaToken, captchaToken }) => {
    set({ isLoading: true, error: null })
    try {
      const session = await authApi.login({ identifier, password, tenantId, branchId, rememberMe, mfaToken, captchaToken })

      get().setSession(session)
      return session
    } catch (err) {
      const message = err.message || 'An error occurred during sign in'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * Finalize the login session using verification state cookies
   */
  completeLogin: async () => {
    set({ isLoading: true, error: null })
    try {
      const session = await authApi.completeLogin()
      get().setSession(session)
      return session
    } catch (err) {
      const message = err.message || 'An error occurred during final authentication'
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

      get().setSession(session)
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
    const savedSession = localStorage.getItem(STORAGE_KEY)
    if (!savedSession) return

    try {
      const newSession = await authApi.refreshSession(user?.refreshToken)

      get().setSession(newSession)
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
   * Log out of the current session.
   *
   * Only clears local state and calls the server to invalidate the refresh
   * token.  Navigation back to /login is handled by the route guards
   * (PrivateRoute / isAuthenticated effects) so we never force a hard reload.
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
    // ✦ No window.location.replace here — React Router guards redirect to /login
  },
}))
