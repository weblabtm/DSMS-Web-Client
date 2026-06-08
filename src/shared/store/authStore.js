/**
 * @file authStore.js
 * @layer LOGIC — Core authentication state. No JSX. No UI imports.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  THIS IS THE SECURITY KERNEL OF THE FRONTEND.
 *  Handle with extreme care. Every other auth-related file depends on this.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE
 * -------
 * Zustand store that owns the entire client-side authentication lifecycle:
 *   • Persisting / restoring the session (localStorage)
 *   • Login, registration, logout
 *   • Silent access-token rotation (refreshToken)
 *   • App-boot rehydration (initStore)
 *   • Active session management (list / revoke)
 *
 * SESSION STORAGE DESIGN
 * ----------------------
 * The session object from the server contains:
 *   { accessToken, refreshToken, userId, roles, tenantId, ... }
 *
 * • accessToken  — short-lived JWT. Sent as Bearer token on every API call
 *                  via http-client.js. Stored in Zustand state only (memory).
 * • refreshToken — long-lived token. Stored in-memory inside Zustand state.
 *                  The localStorage copy intentionally has refreshToken
 *                  REMOVED (see setSession) to limit its exposure to XSS.
 *                  The server ALSO issues an HttpOnly cookie for the refresh
 *                  token so cookie-based flows work without JS access.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Call auth actions through the useAuth() hook from pages/UI.       ║
 * ║    • Add new auth actions as named functions inside this store.         ║
 * ║    • Update STORAGE_KEY here if the key name must change (once).       ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Import this store directly from page/UI components.               ║
 * ║      Use the useAuth() hook (shared/hooks/useAuth.js) instead.         ║
 * ║    • Store the raw refreshToken in localStorage (security risk).       ║
 * ║    • Call window.location anywhere in this file — navigation is the    ║
 * ║      responsibility of React Router guards (ProtectedRoute / App.jsx). ║
 * ║    • Call set() from outside the store — use action functions.         ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * STATE SHAPE
 * -----------
 * {
 *   user:            object | null   — full session object from server (includes accessToken in memory)
 *   isAuthenticated: boolean         — true when a valid session exists
 *   isLoading:       boolean         — true while an async auth action is in flight
 *   isInitialized:   boolean         — true after initStore() has completed (success or failure)
 *   error:           string | null   — human-readable error from the last failed action
 * }
 *
 * INITIALIZATION FLOW (called once on app mount in App.jsx)
 * ---------------------------------------------------------
 *   initStore()
 *     ├─ Read dsms_session from localStorage
 *     ├─ If found → optimistically set user/isAuthenticated
 *     ├─ Call refreshToken() in background → validates with server
 *     │     ├─ Success → update session with new tokens
 *     │     └─ Failure (401/403/400) → logout() (clears state + localStorage)
 *     └─ Set isInitialized = true (always, even on error)
 */

import { create } from 'zustand'
import * as authApi from '../api/authApi'
import { getDeviceInfo } from '../utils/deviceInfo'
import { useUiStore } from './uiStore'

/** localStorage key for the persisted session. Change here only — used in http-client.js too. */
const STORAGE_KEY = 'dsms_session'

export const useAuthStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────────────────────
  user: null,            // full session payload (accessToken lives here in memory)
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,  // guards against flash-redirects on page reload
  error: null,

  // ─── Simple setters ──────────────────────────────────────────────────────
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  /**
   * Persist a session returned from any auth API endpoint.
   *
   * SECURITY NOTE: The copy saved to localStorage intentionally strips the
   * refreshToken so it is never accessible to XSS scripts via localStorage.
   * The in-memory Zustand state (user) retains the refreshToken so that
   * http-client.js can use it for silent token rotation within the same tab.
   *
   * @param {import('../api/authApi').AuthSessionResponse} session
   */
  setSession: (session) => {
    // Strip refreshToken before writing to localStorage (XSS mitigation)
    const safeSession = session ? { ...session } : {}
    delete safeSession.refreshToken
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSession))

    set({
      user: session,      // full object including refreshToken lives in memory only
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
  },

  /**
   * Initialize the store on app boot.
   *
   * Called ONCE from App.jsx's useEffect on mount. Restores any saved session
   * and immediately validates it against the server via a token refresh.
   * Sets isInitialized = true when done so ProtectedRoute stops showing the
   * loading spinner and renders the real page or redirect.
   *
   * ⚠️  AGENT WARNING: Do NOT call initStore() from anywhere other than App.jsx.
   *     Calling it twice creates a race condition with two concurrent refreshes.
   */
  initStore: async () => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY)
      if (savedSession) {
        const parsed = JSON.parse(savedSession)
        if (parsed && parsed.userId) {
          // Optimistically restore session so the UI has something to work with
          // while the background refresh runs. ProtectedRoute will show a spinner
          // because isInitialized is still false at this point.
          set({
            user: parsed,
            isAuthenticated: true,
            isInitialized: false,
          })

          // Validate the session with the server. If the refresh token is still
          // valid the server issues new tokens. If not, logout() is called.
          try {
            await get().refreshToken()
          } catch (refreshErr) {
            // refreshToken() already called logout() internally for 401/403/400.
            // Log the warning but do not rethrow — we still want to reach finally.
            console.warn('Failed to refresh session on initialization:', refreshErr.message)
          }
        }
      }
    } catch (err) {
      // Corrupt or unparseable data in localStorage — clear it and start fresh.
      console.error('Error during auth storage rehydration:', err)
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      // Always mark as initialized so ProtectedRoute stops showing the spinner
      // regardless of whether the session was valid.
      set({ isInitialized: true })
    }
  },

  /**
   * Authenticate with identifier (email / phone) + password.
   *
   * Silently collects device metadata (fingerprint, OS, platform) before
   * sending the request. Device info is used by the server for session
   * anomaly detection — failures are non-fatal and never block login.
   *
   * On success: calls setSession() which persists the session.
   * On failure: sets error state and re-throws so the Login UI can respond.
   *
   * @param {{ identifier: string, password: string, tenantId?: string,
   *            branchId?: string, rememberMe?: boolean, mfaToken?: string,
   *            captchaToken?: string }} credentials
   * @returns {Promise<import('../api/authApi').AuthSessionResponse>}
   */
  login: async ({ identifier, password, tenantId, branchId, rememberMe, mfaToken, captchaToken }) => {
    set({ isLoading: true, error: null })
    try {
      // Collect device metadata without blocking on failures
      let deviceInfo = {}
      try { deviceInfo = await getDeviceInfo() } catch { /* non-fatal — never block login */ }

      const session = await authApi.login({
        identifier, password, tenantId, branchId, rememberMe, mfaToken, captchaToken,
        ...deviceInfo,
      })

      get().setSession(session)
      return session
    } catch (err) {
      const message = err.message || 'An error occurred during sign in'
      set({ error: message, isLoading: false })
      throw err // re-throw so the UI form can display the error
    }
  },

  /**
   * Complete a multi-step login using server-set verification cookies.
   *
   * Called after OTP / CAPTCHA challenges complete and the browser has the
   * required HttpOnly cookies set. The server reads those cookies and issues
   * a full session if they are valid.
   *
   * @returns {Promise<import('../api/authApi').AuthSessionResponse>}
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
   * Register a new user account.
   *
   * Without inviterToken → only 'Tenant Admin' self-registration is allowed.
   * With inviterToken    → allowed roles are controlled by the inviter's role
   *                        (see useAuth.js canInviteRole for the client-side
   *                        mirror of the server's AuthService rules).
   *
   * @param {{ identifier: string, password: string, role?: string,
   *            tenantId?: string, branchId?: string }} account
   * @param {string|null} inviterToken  Access token of the inviting user
   * @returns {Promise<import('../api/authApi').AuthSessionResponse>}
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
   * Silently rotate the access token using the refresh token.
   *
   * Called:
   *   1. On app boot from initStore() to validate the restored session.
   *   2. Automatically by http-client.js when any API call returns 401.
   *
   * If the server rejects the refresh token (400 / 401 / 403), the session
   * is considered expired and logout() is called. ProtectedRoute will then
   * redirect the user to /login via the isAuthenticated check.
   *
   * ⚠️  AGENT WARNING: Do NOT add navigation / redirect calls here.
   *     Redirects are handled by React Router guards that react to state changes.
   *
   * @returns {Promise<import('../api/authApi').AuthSessionResponse>}
   */
  refreshToken: async () => {
    const { user } = get()
    const savedSession = localStorage.getItem(STORAGE_KEY)
    // If there is nothing saved there is nothing to refresh
    if (!savedSession) return

    try {
      const newSession = await authApi.refreshSession(user?.refreshToken)
      get().setSession(newSession)
      return newSession
    } catch (err) {
      console.error('Token refresh failed:', err)

      // Treat 400 / 401 / 403 as definitive token expiry → force logout
      if (err.status === 400 || err.status === 401 || err.status === 403) {
        get().logout()
      }
      throw err
    }
  },

  /**
   * Log out of the current session.
   *
   * Order of operations:
   *   1. Clear localStorage (immediate)
   *   2. Clear Zustand state (immediate) — ProtectedRoute reacts to this
   *   3. Fire-and-forget POST /auth/logout to invalidate the server session
   *
   * Navigation back to /login is handled by ProtectedRoute / PublicRoute
   * reacting to isAuthenticated becoming false. We never force a hard reload.
   *
   * ⚠️  AGENT WARNING: Do NOT add window.location.replace() or
   *     window.location.href = '...' here. That would bypass React Router
   *     and break any in-flight navigation or state cleanup.
   */
  logout: async () => {
    const { user } = get()
    const refreshToken = user?.refreshToken

    // Step 1: Trigger global loader
    try {
      useUiStore.getState().showLoader('Signing out, please wait...')
    } catch (e) {
      console.warn('Failed to trigger global loader during logout:', e)
    }

    // Step 2 & 3: Immediate local cleanup
    localStorage.removeItem(STORAGE_KEY)
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    })

    // Step 4: Background server call — fire and forget.
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch (err) {
        // Non-fatal: local session is already cleared. Log and continue.
        console.warn('Logout endpoint call failed:', err)
      }
    }

    // Wait 800ms to allow a premium feeling exit transition
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Step 5: Hide global loader
    try {
      useUiStore.getState().hideLoader()
    } catch (e) {
      console.warn('Failed to clear global loader during logout:', e)
    }
    // ✦ No window.location here — React Router guards handle the redirect
  },

  /**
   * Fetch all active sessions for the authenticated user.
   * Used by the ManageDevices / Active Sessions settings page.
   *
   * @returns {Promise<Array<{ sessionId: string, deviceOs?: string, devicePlatform?: string,
   *                           deviceFingerprint?: string, createdAt: number, expiresAt: number,
   *                           rememberMe: boolean }>>}
   */
  getActiveSessions: async () => {
    const { user } = get()
    const accessToken = user?.accessToken
    if (!accessToken) throw new Error('Not authenticated')
    const data = await authApi.getActiveSessions(accessToken)
    return data?.sessions ?? []
  },

  /**
   * Revoke (terminate) a specific session by its server-issued ID.
   * Used by the ManageDevices page to let users sign out of other devices.
   *
   * @param {string} sessionId
   */
  revokeSession: async (sessionId) => {
    const { user } = get()
    const accessToken = user?.accessToken
    if (!accessToken) throw new Error('Not authenticated')
    await authApi.revokeSession(sessionId, accessToken)
  },
}))
