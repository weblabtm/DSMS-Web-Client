/**
 * @file http-client.js
 * @layer LOGIC — Authenticated HTTP client for all business API calls.
 *                No JSX. No UI imports.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ALL NON-AUTH API CALLS MUST GO THROUGH requestJson().
 *  DO NOT USE raw fetch() FOR AUTHENTICATED ENDPOINTS.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE
 * -------
 * A thin fetch wrapper that automatically:
 *   1. Injects the Bearer access token from the saved session.
 *   2. Injects the x-tenant-id header for server-side tenant isolation.
 *   3. Detects 401 responses and performs a silent token refresh (one
 *      shared refresh promise so concurrent requests don't trigger N refreshes).
 *   4. Retries the original request once with the new access token.
 *   5. Forces logout if the refresh itself fails.
 *
 * DIFFERENCE FROM authApi.js
 * --------------------------
 * • authApi.js    — raw fetch wrappers for /auth/* endpoints ONLY.
 *                   These endpoints do not require auth headers (except
 *                   /auth/register with an inviter token).
 *                   Uses credentials:'include' for HttpOnly cookie flows.
 *
 * • http-client.js — THIS FILE. Used for all OTHER endpoints (tenants,
 *                    branches, students, sessions, etc.). Reads the access
 *                    token from localStorage and injects it automatically.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Use requestJson() for every authenticated endpoint call.          ║
 * ║    • Add domain-specific API modules (e.g. tenantApi.js, studentApi.js)║
 * ║      that call requestJson() internally.                               ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Call raw fetch() from page components for authenticated routes.   ║
 * ║    • Read localStorage('dsms_session') anywhere other than here        ║
 * ║      and authStore.js. Those are the only two authorised readers.      ║
 * ║    • Add UI logic, navigation, or JSX to this file.                    ║
 * ║    • Remove the singleton refreshPromise pattern — it prevents token   ║
 * ║      thundering-herd when multiple concurrent requests all 401.        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * SILENT REFRESH FLOW
 * -------------------
 *   Request → 401 detected
 *     └─ Is there already a refresh in flight? (refreshPromise !== null)
 *          ├─ YES → await the existing promise (don't start a second refresh)
 *          └─ NO  → start refreshSession(), store promise in refreshPromise
 *               ├─ Success → setSession(newSession), retry original request
 *               └─ Failure → logout() → ProtectedRoute redirects to /login
 *
 * @module http-client
 */

import { useAuthStore } from '../store/authStore.js'
import { refreshSession } from './authApi.js'

/**
 * Singleton promise for the in-flight token refresh.
 * Set to a Promise while a refresh is running; reset to null when done.
 * This prevents multiple concurrent 401s from each triggering their own refresh.
 *
 * ⚠️  AGENT WARNING: Do NOT reset this variable in any other place.
 *     It is managed exclusively inside requestJson().
 */
let refreshPromise = null

/**
 * Parse the response body as JSON if possible, fall back to the raw text,
 * or return undefined for empty bodies.
 *
 * @param {Response} response
 * @returns {Promise<unknown>}
 */
const toJsonBody = async (response) => {
    const text = await response.text()
    if (!text) return undefined
    try {
        return JSON.parse(text)
    } catch {
        return text  // non-JSON response — return raw string
    }
}

/**
 * Ensure paths that are not already absolute URLs start with a leading slash.
 * Absolute URLs (http:// or https://) are passed through unchanged so callers
 * can optionally provide a full URL.
 *
 * @param {string} path
 * @returns {string}
 */
const resolveRequestPath = (path) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }
    return path.startsWith('/') ? path : `/${path}`
}

/**
 * Error type thrown when a request fails.
 * Includes the HTTP status code and the parsed response body as payload.
 */
export class HttpError extends Error {
    /**
     * @param {string}  message  Human-readable error description
     * @param {number}  status   HTTP status code
     * @param {unknown} payload  Parsed response body (may be null)
     */
    constructor(message, status, payload) {
        super(message)
        this.name = 'HttpError'
        this.status = status
        this.payload = payload
    }
}

/**
 * Make an authenticated JSON request.
 *
 * Reads the session from localStorage on every call (not from Zustand) so
 * that the latest tokens are always used even if the store hasn't re-rendered
 * since the last refresh.
 *
 * @param {string} path    Relative path (e.g. '/tenant/abc') or absolute URL
 * @param {object} [options]
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [options.method='GET']
 * @param {object} [options.body]      Request body (will be JSON.stringify'd)
 * @param {object} [options.headers]   Extra headers (merged on top of defaults)
 * @returns {Promise<unknown>}         Parsed JSON response body
 * @throws  {HttpError}                On non-2xx responses
 */
export async function requestJson(path, options = {}) {
    // ── Step 1: Read tokens from localStorage ────────────────────────────
    // We read from localStorage directly (not from the Zustand store) because
    // this function may be called from contexts outside the React component
    // tree (e.g. module-level API helpers). authStore.js is the only other
    // place that reads this key.
    const savedSession = localStorage.getItem('dsms_session')
    let accessToken = null
    let refreshToken = null
    let tenantId = null

    if (savedSession) {
        try {
            const parsed = JSON.parse(savedSession)
            accessToken  = parsed?.accessToken
            refreshToken = parsed?.refreshToken
            tenantId     = parsed?.tenantId
        } catch {
            // Corrupt session data — proceed without tokens.
            // The server will return 401 which triggers the refresh flow.
        }
    }

    // ── Step 2: Build request headers ────────────────────────────────────
    const headers = {
        Accept: 'application/json',
        // Only set Content-Type when there is a body to send
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        // Caller-supplied headers take precedence over defaults
        ...(options.headers ?? {}),
    }

    // Inject Bearer token unless the caller already provided one
    if (accessToken && !headers['Authorization'] && !headers['authorization']) {
        headers['Authorization'] = `Bearer ${accessToken}`
    }

    // Inject tenant ID header for server-side tenant isolation.
    // The server uses this to scope DB queries — never remove this.
    if (tenantId && !headers['x-tenant-id'] && !headers['X-Tenant-ID']) {
        headers['x-tenant-id'] = tenantId
    }

    // ── Step 3: Send the request ──────────────────────────────────────────
    const requestOptions = {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        credentials: 'same-origin',
    }

    const requestPath = resolveRequestPath(path)
    let response = await fetch(requestPath, requestOptions)

    // ── Step 4: Silent token refresh on 401 ──────────────────────────────
    // If the access token expired, attempt a silent refresh then retry.
    if (response.status === 401 && refreshToken) {
        try {
            // Singleton pattern: if another concurrent request already kicked
            // off a refresh, await that promise instead of starting a new one.
            if (!refreshPromise) {
                refreshPromise = refreshSession(refreshToken)
                    .then((newSession) => {
                        // Update auth store with the new session tokens
                        useAuthStore.getState().setSession(newSession)
                        refreshPromise = null
                        return newSession
                    })
                    .catch((err) => {
                        refreshPromise = null
                        // Refresh failed (token expired / invalid) → force logout.
                        // ProtectedRoute will react to isAuthenticated → false
                        // and redirect to /login.
                        useAuthStore.getState().logout()
                        throw err
                    })
            }

            const newSession = await refreshPromise

            // Retry the original request with the new access token
            const retryHeaders = {
                ...headers,
                'Authorization': `Bearer ${newSession.accessToken}`,
            }

            response = await fetch(requestPath, {
                ...requestOptions,
                headers: retryHeaders,
            })
        } catch (refreshErr) {
            throw new HttpError(
                `Request to ${path} failed and token refresh also failed`,
                401,
                refreshErr.payload ?? null
            )
        }
    }

    // ── Step 5: Parse and return (or throw) ──────────────────────────────
    const payload = await toJsonBody(response)

    if (!response.ok) {
        throw new HttpError(
            `Request to ${path} failed with status ${response.status}`,
            response.status,
            payload,
        )
    }

    return payload
}