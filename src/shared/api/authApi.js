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
  /** @param {string} message @param {number} status */
  constructor(message, status) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
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
    throw new AuthApiError(message, response.status)
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
export async function login({ identifier, password, tenantId, branchId, rememberMe }) {
  return request('/auth/login', {
    body: {
      identifier,
      password,
      ...(tenantId ? { tenantId } : {}),
      ...(branchId ? { branchId } : {}),
      ...(rememberMe !== undefined ? { rememberMe } : {}),
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
