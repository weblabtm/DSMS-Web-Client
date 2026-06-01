import { API_ENDPOINTS } from '../constants/api-endpoints.js'

const toStringOrNull = (value) => {
    if (value === undefined || value === null) {
        return null
    }

    const text = String(value).trim()

    return text.length > 0 ? text : null
}

const getGlobalRuntimeConfig = () => {
    if (typeof window === 'undefined') {
        return null
    }

    return window.__DSMS_RUNTIME_CONFIG__ ?? null
}

export const getRuntimeApiBaseUrl = () => {
    const globalConfig = getGlobalRuntimeConfig()

    return globalConfig?.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? window.location.origin
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
    const response = await fetch(API_ENDPOINTS.runtimeConfig, {
        headers: {
            Accept: 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Unable to load runtime config (${response.status})`)
    }

    const payload = await response.json()

    return {
        apiBaseUrl: String(payload.apiBaseUrl ?? window.location.origin),
        host: String(payload.host ?? window.location.host),
        hostname: String(payload.hostname ?? window.location.hostname),
        tenantSlug: toStringOrNull(payload.tenantSlug),
    }
}