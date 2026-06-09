/**
 * @file authApi.js
 * @layer LOGIC — Raw HTTP wrappers for /auth/* endpoints. No JSX. No UI imports.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  THIS FILE IS FOR AUTH ENDPOINTS ONLY (/auth/*).
 *  For all other authenticated API calls, use http-client.js (requestJson).
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE
 * -------
 * Low-level fetch wrappers for the auth module. Each function maps 1:1 to a
 * server endpoint and returns the parsed JSON on success, or throws an
 * AuthApiError with a human-readable message and the HTTP status code.
 *
 * WHY A SEPARATE CLIENT FROM http-client.js?
 * -------------------------------------------
 * Auth endpoints (/auth/login, /auth/refresh, /auth/logout) are called BEFORE
 * or DURING the session lifecycle, so they cannot depend on having a valid
 * access token in localStorage. They use raw fetch with credentials:'include'
 * so the browser sends the HttpOnly refresh-token cookie automatically.
 *
 * http-client.js reads the access token from localStorage and is used for all
 * other (business logic) endpoints that require authentication.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Add new /auth/* endpoint wrappers to this file.                  ║
 * ║    • Keep credentials:'include' on all request() calls so HttpOnly    ║
 * ║      cookies are automatically included.                               ║
 * ║    • Throw AuthApiError (not plain Error) so callers can inspect       ║
 * ║      the HTTP status code via err.status.                              ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Add non-auth endpoints here (use http-client.js instead).        ║
 * ║    • Catch and swallow errors here — let them propagate to the store.  ║
 * ║    • Import authStore or tenantStore — this file must have no circular ║
 * ║      dependencies with the stores.                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * ENDPOINT REFERENCE (matches server routes)
 * ------------------------------------------
 *   POST /auth/login              – no auth required
 *   POST /auth/register           – optional Bearer token (inviter)
 *   POST /auth/refresh            – no auth required (uses HttpOnly cookie)
 *   POST /auth/logout             – no auth required (fire-and-forget)
 *   POST /auth/otp/generate       – no auth required
 *   POST /auth/otp/validate       – no auth required
 *   POST /auth/captcha/validate   – no auth required
 *   POST /auth/login/complete     – no auth required (uses HttpOnly cookies)
 *   GET  /auth/sessions           – requires Bearer token
 *   DELETE /auth/sessions/:id     – requires Bearer token
 *   GET  /auth/unlock/details     – no auth required
 *   GET  /tenant/slug/:slug/availability – no auth required
 *   POST /tenant                  – requires Bearer token (Tenant Admin)
 */

import { getRuntimeApiBaseUrl } from '../config/runtime-config.js'

// ─────────────────────────────────────────────────────────────────────────────
// Error type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Thrown by every function in this module when the server returns a non-2xx
 * response. Callers (authStore.js) check err.status to decide whether to
 * trigger a logout (401/403) or display a field-level error (400/422).
 */
export class AuthApiError extends Error {
  /**
   * @param {string} message  Human-readable error from the server response
   * @param {number} status   HTTP status code
   * @param {any}    [data]   Full parsed response body for advanced error handling
   */
  constructor(message, status, data = null) {
    super(message)
    this.name   = 'AuthApiError'
    this.status = status
    this.data   = data
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal request helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Internal fetch wrapper for all auth endpoints.
 * Not exported — callers use the named functions below.
 *
 * Always sends credentials:'include' so HttpOnly cookies (refresh token,
 * OTP state, CAPTCHA state) are included in every request automatically.
 *
 * @param {string} path   Relative path, e.g. '/auth/login'
 * @param {{ method?: string; body?: unknown; token?: string }} opts
 * @returns {Promise<unknown>}  Parsed JSON body
 * @throws  {AuthApiError}      On non-2xx responses
 */
async function request(path, { method = 'POST', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  // Optional Bearer token (used by /auth/register when called with an inviter token)
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${getRuntimeApiBaseUrl()}${path}`, {
    method,
    headers,
    credentials: 'include',  // ⚠️ Required for HttpOnly cookie flows — do not remove
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // 204 No Content — nothing to parse
  if (response.status === 204) return null

  let data
  try {
    data = await response.json()
  } catch {
    throw new AuthApiError('Server returned an invalid response', response.status)
  }

  if (!response.ok) {
    // Prefer message > error > generic fallback from the response body
    const message = data?.message ?? data?.error ?? `Request failed (${response.status})`
    throw new AuthApiError(message, response.status, data)
  }

  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authenticate with identifier (email or phone) + password.
 * Device metadata is sent to support server-side session anomaly detection.
 *
 * @param {{ identifier: string; password: string; tenantId?: string;
 *            branchId?: string; rememberMe?: boolean; mfaToken?: string;
 *            captchaToken?: string; deviceFingerprint?: string;
 *            deviceOs?: string; devicePlatform?: string }} credentials
 * @returns {Promise<import('./authTypes').AuthSessionResponse>}
 */
export async function login({ identifier, password, tenantId, branchId, rememberMe, mfaToken, captchaToken, deviceFingerprint, deviceOs, devicePlatform }) {
  return request('/auth/login', {
    body: {
      identifier,
      password,
      ...(tenantId          ? { tenantId }          : {}),
      ...(branchId          ? { branchId }          : {}),
      ...(rememberMe !== undefined ? { rememberMe } : {}),
      ...(mfaToken          ? { mfaToken }          : {}),
      ...(captchaToken      ? { captchaToken }      : {}),
      ...(deviceFingerprint ? { deviceFingerprint } : {}),
      ...(deviceOs          ? { deviceOs }          : {}),
      ...(devicePlatform    ? { devicePlatform }    : {}),
    },
  })
}

/**
 * Register a new user account.
 *
 * Without inviterToken  → only 'Tenant Admin' self-registration is accepted.
 * With    inviterToken  → the inviter's role controls which roles can be assigned
 *                         (enforced on the server — see AuthService.ts).
 *
 * @param {{ identifier: string; password: string; role?: string;
 *            tenantId?: string; branchId?: string }} account
 * @param {string|null} [inviterToken]  Access token of the inviting user, if any.
 * @returns {Promise<import('./authTypes').AuthSessionResponse>}
 */
export async function register(
  { identifier, password, role, tenantId, branchId },
  inviterToken = null,
) {
  return request('/auth/register', {
    body: {
      identifier,
      password,
      ...(role     ? { role }     : {}),
      ...(tenantId ? { tenantId } : {}),
      ...(branchId ? { branchId } : {}),
    },
    token: inviterToken ?? undefined,
  })
}

/**
 * Obtain a new access token using a refresh token.
 *
 * The server also accepts the refresh token from the HttpOnly cookie
 * (credentials:'include' in request() handles this automatically).
 * Passing the in-memory refreshToken in the body is the fallback for
 * environments where cookies are restricted.
 *
 * @param {string} [refreshToken]  In-memory refresh token from authStore
 * @returns {Promise<import('./authTypes').AuthSessionResponse>}
 */
export async function refreshSession(refreshToken) {
  return request('/auth/refresh', { body: refreshToken ? { refreshToken } : undefined })
}

/**
 * Invalidate the current session on the server.
 * Fire-and-forget — always treated as success on the client regardless of
 * the server response (local state is cleared by authStore.logout() first).
 *
 * @param {string} [refreshToken]
 * @returns {Promise<void>}
 */
export async function logout(refreshToken) {
  await request('/auth/logout', { body: refreshToken ? { refreshToken } : undefined }).catch(() => {
    // Intentionally swallowed — local session is already cleared by authStore.logout().
  })
}

/**
 * Create a new tenant (school) and link it to an existing Tenant Admin account.
 *
 * Must be called AFTER /auth/register so the Tenant Admin exists in the
 * database and we have a valid accessToken to authenticate this request.
 *
 * @param {string} name                    Human-readable school name (e.g. "Zenith Academy")
 * @param {string} slug                    URL slug for wildcard subdomains
 * @param {string} tenantAdminIdentifier   Email of the Tenant Admin created in the register step
 * @param {string} accessToken             Bearer token from /auth/register response
 * @returns {Promise<{ id: string; name: string; slug?: string | null; isActive: boolean; createdAt: string; updatedAt: string }>}
 */
export async function createTenant(name, slug, tenantAdminIdentifier, accessToken) {
  return request('/tenant', {
    body: { name, slug, tenantAdminIdentifier },
    token: accessToken,
  })
}

/**
 * Check whether a tenant slug is available before registration.
 *
 * @param {string} slug
 * @returns {Promise<{ slug: string; available: boolean; reason?: 'invalid' | 'reserved' | 'taken' }>}
 */
export async function checkTenantSlugAvailability(slug) {
  return request(`/tenant/slug/${encodeURIComponent(slug)}/availability`, { method: 'GET' })
}

/**
 * Request a new OTP code to be sent to the user's email or phone.
 * Used for both MFA during login and account unlock flows.
 *
 * @param {{ email?: string; phoneNumber?: string; captchaToken?: string;
 *            mfaToken?: string; unlockToken?: string;
 *            deviceFingerprint?: string; deviceOs?: string; devicePlatform?: string }} payload
 * @returns {Promise<{ message: string; token: string }>}
 */
export async function generateOtp({ email, phoneNumber, captchaToken, mfaToken, unlockToken, deviceFingerprint, deviceOs, devicePlatform }) {
  return request('/auth/otp/generate', {
    body: {
      ...(email             ? { email }             : {}),
      ...(phoneNumber       ? { phoneNumber }       : {}),
      ...(captchaToken      ? { captchaToken }      : {}),
      ...(mfaToken          ? { mfaToken }          : {}),
      ...(unlockToken       ? { unlockToken }       : {}),
      ...(deviceFingerprint ? { deviceFingerprint } : {}),
      ...(deviceOs          ? { deviceOs }          : {}),
      ...(devicePlatform    ? { devicePlatform }    : {}),
    },
  })
}

/**
 * Validate an OTP code entered by the user.
 *
 * On success the server sets the otp_verified_token HttpOnly cookie,
 * which is later consumed by /auth/login/complete.
 *
 * @param {{ otp: string; token?: string; mfaToken?: string; unlockToken?: string;
 *            deviceFingerprint?: string; deviceOs?: string; devicePlatform?: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function validateOtp({ otp, token, mfaToken, unlockToken, deviceFingerprint, deviceOs, devicePlatform }) {
  return request('/auth/otp/validate', {
    body: {
      otp,
      ...(token             ? { token }             : {}),
      ...(mfaToken          ? { mfaToken }          : {}),
      ...(unlockToken       ? { unlockToken }       : {}),
      ...(deviceFingerprint ? { deviceFingerprint } : {}),
      ...(deviceOs          ? { deviceOs }          : {}),
      ...(devicePlatform    ? { devicePlatform }    : {}),
    },
  })
}

/**
 * Fetch contact details (email / phone) for a locked account using the unlock token.
 * Used by the account unlock flow to pre-fill contact info on the UI.
 *
 * @param {string} token  Unlock token from the email link
 * @returns {Promise<{ email: string; phoneNumber: string }>}
 */
export async function getUnlockDetails(token) {
  return request(`/auth/unlock/details?token=${encodeURIComponent(token)}`, { method: 'GET' })
}

/**
 * Validate a CAPTCHA token with the server.
 * On success the server sets the captcha_verified_token HttpOnly cookie,
 * which is consumed by /auth/login/complete.
 *
 * @param {string} captchaToken  Token from the Cloudflare Turnstile widget
 * @param {{ deviceFingerprint?: string; deviceOs?: string; devicePlatform?: string }} [deviceInfo]
 * @returns {Promise<{ message: string; token: string }>}
 */
export async function validateCaptcha(captchaToken, { deviceFingerprint, deviceOs, devicePlatform } = {}) {
  return request('/auth/captcha/validate', {
    body: {
      captchaToken,
      ...(deviceFingerprint ? { deviceFingerprint } : {}),
      ...(deviceOs          ? { deviceOs }          : {}),
      ...(devicePlatform    ? { devicePlatform }    : {}),
    }
  })
}

/**
 * Finalize a multi-step login using the HttpOnly cookies set during OTP / CAPTCHA steps.
 * The server reads and validates those cookies then issues a full session.
 *
 * Called by authStore.completeLogin() after the user passes all challenges.
 *
 * @returns {Promise<import('./authTypes').AuthSessionResponse>}
 */
export async function completeLogin() {
  return request('/auth/login/complete', { body: {} })
}

/**
 * Fetch all active sessions for the currently authenticated user.
 * Used by the ManageDevices / Active Sessions settings page.
 *
 * @param {string} accessToken  Bearer token
 * @returns {Promise<{ sessions: Array<{ sessionId: string; deviceOs?: string;
 *                      devicePlatform?: string; deviceFingerprint?: string;
 *                      createdAt: number; expiresAt: number; rememberMe: boolean }> }>}
 */
export async function getActiveSessions(accessToken) {
  return request('/auth/sessions', { method: 'GET', token: accessToken })
}

/**
 * Revoke (delete) a specific session by ID.
 * Used by the ManageDevices page to sign out of other devices.
 *
 * @param {string} sessionId    ID of the session to revoke
 * @param {string} accessToken  Bearer token of the currently authenticated user
 * @returns {Promise<null>}
 */
export async function revokeSession(sessionId, accessToken) {
  return request(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    token: accessToken,
  })
}
