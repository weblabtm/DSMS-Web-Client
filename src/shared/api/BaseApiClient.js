/**
 * @file BaseApiClient.js
 * @layer LOGIC — Abstract base class for all domain API modules. No JSX. No UI imports.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ALL DOMAIN API MODULES MUST EXTEND THIS CLASS.
 *  DO NOT CALL requestJson() OR fetch() DIRECTLY FROM PAGE COMPONENTS.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE
 * -------
 * BaseApiClient is the single, enforced entry point for every authenticated
 * HTTP request in the DSMS frontend. It wraps requestJson() (http-client.js)
 * and exposes five protected helpers — get / post / put / patch / delete —
 * that all domain subclasses use to define their endpoint methods.
 *
 * WHY A BASE CLASS?
 * -----------------
 * Without a centralised base class developers (and AI coding agents) tend to:
 *   • Call raw fetch() directly from page components (misses auth headers).
 *   • Duplicate header / error-handling logic across modules.
 *   • Forget to include x-tenant-id or Authorization on new endpoints.
 *
 * Every method defined in a BaseApiClient subclass automatically gets:
 *   ✅ Bearer access token injected from localStorage/Zustand session.
 *   ✅ x-tenant-id injected from the saved session.
 *   ✅ Silent token refresh on 401 (one shared refresh, no thundering-herd).
 *   ✅ Typed HttpError thrown on non-2xx so callers catch a consistent error.
 *
 * RELATIONSHIP TO OTHER API FILES
 * --------------------------------
 *   BaseApiClient   — THIS FILE. The OO layer that domain modules inherit.
 *   http-client.js  — The transport layer. BaseApiClient delegates to requestJson().
 *                     Never import requestJson() outside of this file.
 *   authApi.js      — Auth-only endpoints (/auth/*). These are PRE-session calls
 *                     that use HttpOnly cookies and must NOT extend BaseApiClient.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Create one subclass per domain entity (e.g. StudentApiClient).    ║
 * ║    • Place each subclass at:                                            ║
 * ║        src/entities/<domain>/api/<domain>Api.js                        ║
 * ║    • Export a singleton from the subclass file:                        ║
 * ║        export const studentApi = new StudentApiClient()                ║
 * ║    • Call only this.get / this.post / this.put / this.patch /          ║
 * ║      this.delete inside your subclass methods.                         ║
 * ║    • Pass the base path to the constructor (e.g. '/students').         ║
 * ║      Use this.basePath to build endpoint strings.                      ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Import or call requestJson() from domain API files or components. ║
 * ║    • Call raw fetch() for any authenticated endpoint anywhere.         ║
 * ║    • Extend BaseApiClient for /auth/* endpoints — use authApi.js.      ║
 * ║    • Instantiate more than one instance of a subclass (use singletons).║
 * ║    • Add UI logic, React hooks, or JSX to any API module.             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * QUICK-START: HOW TO ADD A NEW DOMAIN API MODULE
 * ------------------------------------------------
 * 1. Create   src/entities/<domain>/api/<domain>Api.js
 * 2. Extend   BaseApiClient
 * 3. Call     super('<base-path>') in your constructor
 * 4. Add your endpoint methods using this.get / this.post / etc.
 * 5. Export a singleton at the bottom of the file.
 *
 * Example:
 *
 *   import { BaseApiClient } from '../../../shared/api/BaseApiClient.js'
 *
 *   class StudentApiClient extends BaseApiClient {
 *     constructor() { super('/students') }
 *
 *     list(params)        { return this.get('/', { params }) }
 *     getById(id)         { return this.get(`/${id}`) }
 *     create(data)        { return this.post('/', data) }
 *     update(id, data)    { return this.put(`/${id}`, data) }
 *     remove(id)          { return this.delete(`/${id}`) }
 *   }
 *
 *   export const studentApi = new StudentApiClient()
 *
 * @module BaseApiClient
 */

import { requestJson } from './http-client.js'

// ─────────────────────────────────────────────────────────────────────────────
// BaseApiClient
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abstract base class for all domain API clients.
 *
 * Subclasses receive five protected transport methods and a `basePath` string.
 * They should only ever define public methods that call those five helpers.
 *
 * @abstract
 */
export class BaseApiClient {
    /**
     * @param {string} basePath  The API base path for this domain module,
     *                           e.g. '/students' or '/instructor'. Leading slash
     *                           required. Will be prepended to every path passed
     *                           to the transport helpers.
     *
     * ⚠️  AGENT WARNING: Do NOT call super() with a trailing slash.
     *     Path segments are always joined as `${basePath}${path}`, so a trailing
     *     slash on the basePath produces double-slash URLs like //students.
     */
    constructor(basePath) {
        if (new.target === BaseApiClient) {
            throw new Error(
                'BaseApiClient is abstract and cannot be instantiated directly. ' +
                'Create a subclass and call super(basePath) from its constructor.'
            )
        }
        if (!basePath || typeof basePath !== 'string' || !basePath.startsWith('/')) {
            throw new Error(
                `BaseApiClient: basePath must be a non-empty string starting with "/". Got: ${JSON.stringify(basePath)}`
            )
        }
        /** @protected */
        this.basePath = basePath
    }

    // ─── Protected transport helpers ────────────────────────────────────────
    // All five methods below delegate to requestJson().
    // Subclasses MUST use only these helpers — never call requestJson directly.

    /**
     * Authenticated GET request.
     *
     * @protected
     * @param {string}  path            Path relative to this.basePath (e.g. '/', `/${id}`)
     * @param {object}  [options={}]    Extra options forwarded to requestJson (e.g. { headers })
     * @returns {Promise<unknown>}      Parsed JSON response body
     * @throws  {import('./http-client.js').HttpError}  On non-2xx responses
     *
     * @example
     * // Inside a subclass method:
     * list()       { return this.get('/') }
     * getById(id)  { return this.get(`/${id}`) }
     */
    get(path, options = {}) {
        return requestJson(this._resolvePath(path), { ...options, method: 'GET' })
    }

    /**
     * Authenticated POST request.
     *
     * @protected
     * @param {string}  path            Path relative to this.basePath
     * @param {object}  [body]          Request body — will be JSON-stringified
     * @param {object}  [options={}]    Extra options forwarded to requestJson
     * @returns {Promise<unknown>}
     * @throws  {import('./http-client.js').HttpError}
     *
     * @example
     * create(data) { return this.post('/', data) }
     */
    post(path, body, options = {}) {
        return requestJson(this._resolvePath(path), { ...options, method: 'POST', body })
    }

    /**
     * Authenticated PUT request (full replacement).
     *
     * @protected
     * @param {string}  path
     * @param {object}  [body]
     * @param {object}  [options={}]
     * @returns {Promise<unknown>}
     * @throws  {import('./http-client.js').HttpError}
     *
     * @example
     * replace(id, data) { return this.put(`/${id}`, data) }
     */
    put(path, body, options = {}) {
        return requestJson(this._resolvePath(path), { ...options, method: 'PUT', body })
    }

    /**
     * Authenticated PATCH request (partial update).
     *
     * @protected
     * @param {string}  path
     * @param {object}  [body]
     * @param {object}  [options={}]
     * @returns {Promise<unknown>}
     * @throws  {import('./http-client.js').HttpError}
     *
     * @example
     * update(id, data) { return this.patch(`/${id}`, data) }
     */
    patch(path, body, options = {}) {
        return requestJson(this._resolvePath(path), { ...options, method: 'PATCH', body })
    }

    /**
     * Authenticated DELETE request.
     *
     * @protected
     * @param {string}  path
     * @param {object}  [options={}]
     * @returns {Promise<unknown>}
     * @throws  {import('./http-client.js').HttpError}
     *
     * @example
     * remove(id) { return this.delete(`/${id}`) }
     */
    delete(path, options = {}) {
        return requestJson(this._resolvePath(path), { ...options, method: 'DELETE' })
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    /**
     * Join basePath and a relative path segment.
     * Handles the case where `path` starts with '/' (avoids double-slash).
     *
     * @private
     * @param {string} path  Relative path, e.g. '/', `/${id}`, '/export'
     * @returns {string}     Absolute-ish path, e.g. '/students/42'
     */
    _resolvePath(path) {
        if (!path || path === '/') return this.basePath
        const relativePart = path.startsWith('/') ? path : `/${path}`
        return `${this.basePath}${relativePart}`
    }
}
