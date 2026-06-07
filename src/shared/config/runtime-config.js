import { API_ENDPOINTS } from '../constants/api-endpoints.js'

const toStringOrNull = (value) => {
    if (value === undefined || value === null) {
        return null
    }

    const text = String(value).trim()

    return text.length > 0 ? text : null
}

export const getGlobalRuntimeConfig = () => {
    if (typeof window === 'undefined') {
        return null
    }

    return window.__DSMS_RUNTIME_CONFIG__ ?? null
}

export const getRuntimeApiBaseUrl = () => {
    const globalConfig = getGlobalRuntimeConfig()

    // In production, we must NEVER fall back to the web app origin.
    // If VITE_API_BASE_URL is not configured, fail fast so we don't POST to the frontend and get 405.
    // NOTE: empty string '' is intentionally valid — it means "use relative paths" (Vite proxy mode / LAN dev).
    const baseUrl = globalConfig?.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL

    if (baseUrl === undefined || baseUrl === null) {
        throw new Error('Missing API base URL. Set VITE_API_BASE_URL (e.g. https://dsms-server.vercel.app)')
    }

    return baseUrl
}


export const setGlobalRuntimeConfig = (config) => {
    if (typeof window === 'undefined') {
        return
    }

    window.__DSMS_RUNTIME_CONFIG__ = config
}

export const buildBaseHostUrl = (pathname = '/login') => {
    return pathname.startsWith('/') ? pathname : `/${pathname}`
}

export const buildTenantPath = (tenantSlug, pathname = '/dashboard') => {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`

    if (!tenantSlug) {
        return normalizedPath
    }

    return `/${encodeURIComponent(String(tenantSlug).trim())}${normalizedPath}`
}

export const createFallbackRuntimeConfig = () => ({
    apiBaseUrl: window.location.origin,
    host: window.location.host,
    hostname: window.location.hostname,
    tenantSlug: null,
})

export async function loadRuntimeConfig() {
    // In dev mode (Vite proxy active) OR when the page is accessed from a non-localhost origin
    // (e.g. a LAN device via 192.168.x.x or 172.x.x.x), use a relative /config URL so the
    // Vite proxy forwards it to the real backend — no absolute localhost URL, no CORS issues.
    const isLanAccess = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const isDev = import.meta.env.DEV;

    let configUrl;
    if (isDev || isLanAccess) {
        configUrl = API_ENDPOINTS.runtimeConfig; // relative: /config — handled by Vite proxy
    } else {
        const baseUrl = getRuntimeApiBaseUrl();
        configUrl = `${baseUrl}${API_ENDPOINTS.runtimeConfig}`;
    }

    const response = await fetch(configUrl, {
        headers: {
            Accept: 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Unable to load runtime config (${response.status})`)
    }

    const payload = await response.json()

    // If the backend returned a localhost apiBaseUrl but we're being accessed from a different
    // host (LAN IP), replace it with '' so all subsequent API calls use relative paths through
    // the Vite proxy. This makes LAN dev access work without any env file changes.
    let resolvedApiBaseUrl = String(payload.apiBaseUrl ?? getRuntimeApiBaseUrl())
    if (isLanAccess) {
        const isLocalhost = resolvedApiBaseUrl.includes('localhost') || resolvedApiBaseUrl.includes('127.0.0.1')
        if (isLocalhost) {
            resolvedApiBaseUrl = '' // use relative paths → Vite proxy handles routing to backend
        }
    }

    return {
        apiBaseUrl: resolvedApiBaseUrl,
        host: String(payload.host ?? window.location.host),
        hostname: String(payload.hostname ?? window.location.hostname),
        tenantSlug: toStringOrNull(payload.tenantSlug),
        recaptchaSiteKey: payload.recaptchaSiteKey || '0x4AAAAAADgL0IjHaom1GpZW',
        captchaSiteKey: payload.captchaSiteKey || '0x4AAAAAADgL0IjHaom1GpZW',
    }
}

