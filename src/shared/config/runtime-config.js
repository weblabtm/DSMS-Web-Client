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
    const baseUrl = globalConfig?.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL

    if (!baseUrl) {
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
    // Important: do not call relative `/config` here.
    // If `/config` is served by the web app origin, it may return a web-origin apiBaseUrl
    // which then causes POST `/auth/login` to hit the frontend (405).
    const baseUrl = getRuntimeApiBaseUrl()

    const response = await fetch(`${baseUrl}${API_ENDPOINTS.runtimeConfig}`, {
        headers: {
            Accept: 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Unable to load runtime config (${response.status})`)
    }

    const payload = await response.json()

    return {
        apiBaseUrl: String(payload.apiBaseUrl ?? baseUrl),
        host: String(payload.host ?? window.location.host),
        hostname: String(payload.hostname ?? window.location.hostname),
        tenantSlug: toStringOrNull(payload.tenantSlug),
        recaptchaSiteKey: payload.recaptchaSiteKey || '0x4AAAAAADgL0IjHaom1GpZW',
        captchaSiteKey: payload.captchaSiteKey || '0x4AAAAAADgL0IjHaom1GpZW',
    }
}

