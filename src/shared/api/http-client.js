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
    const response = await fetch(resolveRequestPath(path), {
        method: options.method ?? 'GET',
        headers: {
            Accept: 'application/json',
            ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers ?? {}),
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        credentials: 'same-origin',
    })

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