/**
 * @file runtime-config.js
 * @layer LOGIC — Runtime configuration helpers. No JSX. No UI imports.
 *
 * PURPOSE
 * -------
 * Provides helpers to read and use the runtime configuration object that is
 * fetched from the server at application boot (see RuntimeConfigProvider).
 *
 * WHY RUNTIME CONFIG?
 * -------------------
 * Build-time environment variables (VITE_API_BASE_URL) are baked into the
 * bundle at build time and cannot be changed after deployment. The runtime
 * config is fetched from the server at boot, allowing operations teams to
 * change the API base URL, reCAPTCHA keys, and tenant slug without rebuilding
 * the frontend bundle.
 *
 * CONFIG FLOW
 * -----------
 * 1. main.jsx renders <RuntimeConfigProvider>
 * 2. RuntimeConfigProvider fetches GET /config from the server
 * 3. setGlobalRuntimeConfig(config) writes the result to window.__DSMS_RUNTIME_CONFIG__
 * 4. getRuntimeApiBaseUrl() reads that value whenever an API call needs the base URL
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Use getRuntimeApiBaseUrl() to get the API base URL in API modules. ║
 * ║    • Use buildTenantPath() to construct all tenant-scoped URLs.        ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Hardcode API base URLs in API modules — always use                ║
 * ║      getRuntimeApiBaseUrl() so the URL is configurable at runtime.     ║
 * ║    • Read window.__DSMS_RUNTIME_CONFIG__ directly — use the helpers    ║
 * ║      in this file which handle null / undefined safely.                ║
 * ║    • Call setGlobalRuntimeConfig() from anywhere other than            ║
 * ║      RuntimeConfigProvider — there should be only one writer.          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { API_ENDPOINTS } from '../constants/api-endpoints.js'

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Coerce a value to a non-empty string or null.
 * Used to safely parse fields from the server config response.
 *
 * @param {unknown} value
 * @returns {string|null}
 */
const toStringOrNull = (value) => {
    if (value === undefined || value === null) return null
    const text = String(value).trim()
    return text.length > 0 ? text : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime config reader / writer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Read the global runtime config object written by setGlobalRuntimeConfig().
 * Returns null in SSR / non-browser environments.
 *
 * @returns {{ apiBaseUrl: string; host: string; hostname: string;
 *             tenantSlug: string|null; recaptchaSiteKey?: string } | null}
 */
export const getGlobalRuntimeConfig = () => {
    if (typeof window === 'undefined') return null
    return window.__DSMS_RUNTIME_CONFIG__ ?? null
}

/**
 * Get the API base URL to prepend to all API request paths.
 *
 * Priority:
 *   1. window.__DSMS_RUNTIME_CONFIG__.apiBaseUrl  (set at runtime from server)
 *   2. import.meta.env.VITE_API_BASE_URL          (set at build time)
 *
 * An empty string '' is valid — it means "use relative paths" which works
 * when the frontend and backend are served from the same origin, or when the
 * Vite proxy is active in development.
 *
 * ⚠️  AGENT WARNING: If both sources are undefined this function THROWS.
 *     This is intentional — a missing API URL causes silent 405 errors that
 *     are very hard to debug. The loud failure is easier to spot and fix.
 *
 * @returns {string}
 * @throws {Error} if no API base URL is configured
 */
export const getRuntimeApiBaseUrl = () => {
    const globalConfig = getGlobalRuntimeConfig()
    const baseUrl = globalConfig?.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL

    if (baseUrl === undefined || baseUrl === null) {
        throw new Error('Missing API base URL. Set VITE_API_BASE_URL (e.g. https://dsms-server.vercel.app)')
    }

    return baseUrl
}

/**
 * Write the runtime config to the global window object.
 * Called ONLY by RuntimeConfigProvider after a successful /config fetch.
 *
 * @param {{ apiBaseUrl: string; host: string; hostname: string;
 *            tenantSlug: string|null; recaptchaSiteKey?: string }} config
 */
export const setGlobalRuntimeConfig = (config) => {
    if (typeof window === 'undefined') return
    window.__DSMS_RUNTIME_CONFIG__ = config
}

// ─────────────────────────────────────────────────────────────────────────────
// URL builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ensure a pathname starts with a leading slash.
 * Used for building non-tenant paths like /login.
 *
 * @param {string} [pathname='/login']
 * @returns {string}
 */
export const buildBaseHostUrl = (pathname = '/login') => {
    return pathname.startsWith('/') ? pathname : `/${pathname}`
}

/**
 * Build a tenant-scoped URL path.
 *
 * Used throughout the app to construct URLs like /:tenantSlug/dashboard.
 * Always use this helper instead of template literals to ensure consistent
 * encoding and to centralise the path format in one place.
 *
 * @param {string|null|undefined} tenantSlug  The tenant's slug (from user.tenantId or tenantStore)
 * @param {string} [pathname='/dashboard']    The path segment after the tenant slug
 * @returns {string}
 *
 * @example
 * buildTenantPath('zenith-academy', '/dashboard') // → '/zenith-academy/dashboard'
 * buildTenantPath(null, '/dashboard')             // → '/dashboard'
 */
export const buildTenantPath = (tenantSlug, pathname = '/dashboard') => {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
    if (!tenantSlug) return normalizedPath
    return `/${encodeURIComponent(String(tenantSlug).trim())}${normalizedPath}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback config (used when the server /config call fails)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a best-effort fallback config when the server /config call fails.
 * Uses the current window origin as the API base URL.
 *
 * ⚠️  NOTE: This fallback is used by RuntimeConfigProvider when the server
 *     is unreachable. API calls will still attempt to use the fallback URL
 *     and will fail with network errors if the server is down.
 *
 * @returns {{ apiBaseUrl: string; host: string; hostname: string; tenantSlug: null }}
 */
export const createFallbackRuntimeConfig = () => {
    let fallbackApiUrl = window.location.origin
    try {
        fallbackApiUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin
    } catch {
        // VITE_API_BASE_URL may not be accessible in all environments
    }
    return {
        apiBaseUrl: fallbackApiUrl,
        host:       window.location.host,
        hostname:   window.location.hostname,
        tenantSlug: null,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Config loader (called by RuntimeConfigProvider on mount)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the runtime configuration from the server.
 *
 * Uses relative URL (/config) in development so the Vite proxy forwards it
 * to the backend, avoiding CORS issues on LAN (mobile device testing, etc.).
 * Uses the absolute API base URL in production.
 *
 * Also normalises the apiBaseUrl for LAN dev access: if the server returns
 * a localhost URL but we are being accessed from a LAN IP, the URL is
 * replaced with '' (relative paths) so all API calls go through the Vite proxy.
 *
 * Called ONLY from RuntimeConfigProvider. Do not call this function directly.
 *
 * @returns {Promise<{ apiBaseUrl: string; host: string; hostname: string;
 *                     tenantSlug: string|null; recaptchaSiteKey: string;
 *                     captchaSiteKey: string }>}
 * @throws {Error} if the server returns a non-ok response
 */
export async function loadRuntimeConfig() {
    const isDev      = import.meta.env.DEV
    const isLanAccess = typeof window !== 'undefined'
                        && isDev
                        && window.location.hostname !== 'localhost'
                        && window.location.hostname !== '127.0.0.1'

    // Use relative URL in dev so Vite proxy handles forwarding
    let configUrl
    if (isDev || isLanAccess) {
        configUrl = API_ENDPOINTS.runtimeConfig  // → '/config'
    } else {
        const baseUrl = getRuntimeApiBaseUrl()
        configUrl = `${baseUrl}${API_ENDPOINTS.runtimeConfig}`
    }

    const response = await fetch(configUrl, {
        headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
        throw new Error(`Unable to load runtime config (${response.status})`)
    }

    const payload = await response.json()

    // LAN dev normalisation: if the server returned a localhost apiBaseUrl
    // but we are on a LAN IP, replace it with '' so requests go via the Vite proxy
    let resolvedApiBaseUrl = String(payload.apiBaseUrl ?? getRuntimeApiBaseUrl())
    if (isLanAccess) {
        const isLocalhost = resolvedApiBaseUrl.includes('localhost')
                         || resolvedApiBaseUrl.includes('127.0.0.1')
        if (isLocalhost) {
            resolvedApiBaseUrl = ''  // relative paths → Vite proxy routes to backend
        }
    }

    return {
        apiBaseUrl:      resolvedApiBaseUrl,
        host:            String(payload.host     ?? window.location.host),
        hostname:        String(payload.hostname ?? window.location.hostname),
        tenantSlug:      toStringOrNull(payload.tenantSlug),
        recaptchaSiteKey: payload.recaptchaSiteKey || '0x4AAAAAADgL0IjHaom1GpZW',
        captchaSiteKey:  payload.captchaSiteKey  || '0x4AAAAAADgL0IjHaom1GpZW',
    }
}
