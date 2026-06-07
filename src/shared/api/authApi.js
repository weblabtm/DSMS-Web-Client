/**
 * authApi.js
 *
 * Low-level HTTP wrappers for the Auth module endpoints.
 * All functions return the parsed JSON body on success, or throw an
 * AuthApiError with a human-readable message and the HTTP status code.
 *
 * Endpoint reference:
 *   POST /auth/login       – no auth required
 *   POST /auth/register    – optional bearer token (inviter)
 *   POST /auth/refresh     – no auth required
 *   POST /auth/logout      – no auth required (fire-and-forget on server)
 */

import { getRuntimeApiBaseUrl } from '../config/runtime-config.js'

// ─────────────────────────────────────────────────────────────────────────────
// Error type
// ─────────────────────────────────────────────────────────────────────────────

export class AuthApiError extends Error {
  /** @param {string} message @param {number} status @param {any} [data] */
  constructor(message, status, data = null) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.data = data
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} path
 * @param {{ method?: string; body?: unknown; token?: string }} opts
 * @returns {Promise<unknown>}
 */
async function request(path, { method = 'POST', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${getRuntimeApiBaseUrl()}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // 204 No Content — no body to parse
  if (response.status === 204) return null

  let data
  try {
    data = await response.json()
  } catch {
    throw new AuthApiError('Server returned an invalid response', response.status)
  }

  if (!response.ok) {
    const message = data?.message ?? data?.error ?? `Request failed (${response.status})`
    throw new AuthApiError(message, response.status, data)
  }

  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authenticate with identifier + password.
 *
 * @param {{ identifier: string; password: string; tenantId?: string; branchId?: string }} credentials
 * @returns {Promise<import('./authTypes').AuthSessionResponse>}
 */
export async function login({ identifier, password, tenantId, branchId, rememberMe, mfaToken, captchaToken, deviceFingerprint, deviceOs, devicePlatform }) {
  return request('/auth/login', {
    body: {
      identifier,
      password,
      ...(tenantId ? { tenantId } : {}),
      ...(branchId ? { branchId } : {}),
      ...(rememberMe !== undefined ? { rememberMe } : {}),
      ...(mfaToken ? { mfaToken } : {}),
      ...(captchaToken ? { captchaToken } : {}),
      ...(deviceFingerprint ? { deviceFingerprint } : {}),
      ...(deviceOs ? { deviceOs } : {}),
      ...(devicePlatform ? { devicePlatform } : {}),
    },
  })
}

/**
 * Register a new account.
 *
 * • Without a token  → only `Tenant Admin` role is accepted (self-register).
 * • With a token     → inviterRole from the token controls which roles are allowed.
 *
 * @param {{ identifier: string; password: string; role?: string; tenantId?: string; branchId?: string }} account
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
      ...(role ? { role } : {}),
      ...(tenantId ? { tenantId } : {}),
      ...(branchId ? { branchId } : {}),
    },
    token: inviterToken ?? undefined,
  })
}

/**
 * Obtain a new access token using a refresh token.
 *
 * @param {string} [refreshToken]
 * @returns {Promise<import('./authTypes').AuthSessionResponse>}
 */
export async function refreshSession(refreshToken) {
  return request('/auth/refresh', { body: refreshToken ? { refreshToken } : undefined })
}

/**
 * Invalidate the current session on the server.
 * Fire-and-forget from the server's perspective; we always treat it as success.
 *
 * @param {string} [refreshToken]
 * @returns {Promise<void>}
 */
export async function logout(refreshToken) {
  await request('/auth/logout', { body: refreshToken ? { refreshToken } : undefined }).catch(() => {
    // Ignore network / server errors during logout — local state is cleared anyway.
  })
}

/**
 * Create a new tenant and link it to an existing Tenant Admin account.
 *
 * Must be called AFTER /auth/register so the Tenant Admin account exists in the
 * database and we have a valid accessToken to authenticate this request.
 *
 * @param {string} name                   Human-readable school name (e.g. "Zenith Academy")
 * @param {string} slug                   Tenant slug used for wildcard subdomains
 * @param {string} tenantAdminIdentifier  Email of the Tenant Admin account created in step 1
 * @param {string} accessToken            Bearer token returned from /auth/register
 * @returns {Promise<{ id: string; name: string; slug?: string | null; isActive: boolean; createdAt: string; updatedAt: string }>} 
 */
export async function createTenant(name, slug, tenantAdminIdentifier, accessToken) {
  return request('/tenant', {
    body: { name, slug, tenantAdminIdentifier },
    token: accessToken,
  })
}

/**
 * Check whether a tenant slug is available.
 *
 * @param {string} slug
 * @returns {Promise<{ slug: string; available: boolean; reason?: 'invalid' | 'reserved' | 'taken' }>}
 */
export async function checkTenantSlugAvailability(slug) {
  return request(`/tenant/slug/${encodeURIComponent(slug)}/availability`, {
    method: 'GET',
  })
}

/**
 * Generate a new OTP code.
 *
 * @param {{ email?: string; phoneNumber?: string; captchaToken?: string }} payload
 * @returns {Promise<{ message: string; token: string }>}
 */
export async function generateOtp({ email, phoneNumber, captchaToken, mfaToken, unlockToken }) {
  return request('/auth/otp/generate', {
    body: {
      ...(email ? { email } : {}),
      ...(phoneNumber ? { phoneNumber } : {}),
      ...(captchaToken ? { captchaToken } : {}),
      ...(mfaToken ? { mfaToken } : {}),
      ...(unlockToken ? { unlockToken } : {}),
    },
  })
}

/**
 * Validate an OTP code.
 *
 * @param {{ otp: string; token?: string }} payload
 * @returns {Promise<{ message: string }>}
 */
export async function validateOtp({ otp, token, mfaToken, unlockToken }) {
  return request('/auth/otp/validate', {
    body: {
      otp,
      ...(token ? { token } : {}),
      ...(mfaToken ? { mfaToken } : {}),
      ...(unlockToken ? { unlockToken } : {}),
    },
  })
}

/**
 * Fetch details for a locked account by token.
 *
 * @param {string} token
 * @returns {Promise<{ email: string; phoneNumber: string }>}
 */
export async function getUnlockDetails(token) {
  return request(`/auth/unlock/details?token=${encodeURIComponent(token)}`, {
    method: 'GET',
  })
}

/**
 * Validate a CAPTCHA token and set the captcha_verified_token cookie.
 *
 * @param {string} captchaToken
 * @returns {Promise<{ message: string; token: string }>}
 */
export async function validateCaptcha(captchaToken) {
  return request('/auth/captcha/validate', {
    body: { captchaToken }
  })
}

/**
 * Finalize the login session using verification state cookies.
 *
 * @returns {Promise<import('./authTypes').AuthSessionResponse>}
 */
export async function completeLogin() {
  return request('/auth/login/complete', {
    body: {}
  })
}

/**
 * Fetch all active sessions for the currently authenticated user.
 *
 * @param {string} accessToken  Bearer token
 * @returns {Promise<{ sessions: Array<{ sessionId: string; deviceOs?: string; devicePlatform?: string; deviceFingerprint?: string; createdAt: number; expiresAt: number; rememberMe: boolean }> }>}
 */
export async function getActiveSessions(accessToken) {
  return request('/auth/sessions', {
    method: 'GET',
    token: accessToken,
  })
}

/**
 * Revoke (delete) a specific session by ID.
 *
 * @param {string} sessionId
 * @param {string} accessToken  Bearer token of the currently authenticated user
 * @returns {Promise<null>}
 */
export async function revokeSession(sessionId, accessToken) {
  return request(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    token: accessToken,
  })
}
