import { useAuthStore } from '../store/authStore.js'
import { refreshSession } from './authApi.js'

let refreshPromise = null

const toJsonBody = async (response) => {
    const text = await response.text()

    if (!text) {
        return undefined
    }

    try {
        return JSON.parse(text)
    } catch {
        return text
    }
}

const resolveRequestPath = (path) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }

    return path.startsWith('/') ? path : `/${path}`
}

export class HttpError extends Error {
    constructor(message, status, payload) {
        super(message)
        this.name = 'HttpError'
        this.status = status
        this.payload = payload
    }
}

export async function requestJson(path, options = {}) {
    const savedSession = localStorage.getItem('dsms_session')
    let accessToken = null
    let refreshToken = null
    let tenantId = null

    if (savedSession) {
        try {
            const parsed = JSON.parse(savedSession)
            accessToken = parsed?.accessToken
            refreshToken = parsed?.refreshToken
            tenantId = parsed?.tenantId
        } catch {
            // ignore
        }
    }

    const headers = {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers ?? {}),
    }

    if (accessToken && !headers['Authorization'] && !headers['authorization']) {
        headers['Authorization'] = `Bearer ${accessToken}`
    }

    if (tenantId && !headers['x-tenant-id'] && !headers['X-Tenant-ID']) {
        headers['x-tenant-id'] = tenantId
    }

    const requestOptions = {
        method: options.method ?? 'GET',
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        credentials: 'same-origin',
    }

    const requestPath = resolveRequestPath(path)
    let response = await fetch(requestPath, requestOptions)

    if (response.status === 401 && refreshToken) {
        try {
            if (!refreshPromise) {
                refreshPromise = refreshSession(refreshToken)
                    .then((newSession) => {
                        useAuthStore.getState().setSession(newSession)
                        refreshPromise = null
                        return newSession
                    })
                    .catch((err) => {
                        refreshPromise = null
                        useAuthStore.getState().logout()
                        throw err
                    })
            }

            const newSession = await refreshPromise

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