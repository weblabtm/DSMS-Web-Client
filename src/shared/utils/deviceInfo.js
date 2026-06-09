/**
 * @file deviceInfo.js
 * @layer LOGIC — Device fingerprinting and metadata. No JSX. No UI imports.
 *
 * PURPOSE
 * -------
 * Collects a stable, privacy-preserving device fingerprint and device metadata
 * (OS, platform) using only browser-standard Web APIs. No third-party libraries.
 *
 * The fingerprint and metadata are sent to the server during login so the
 * server can:
 *   • Associate sessions with specific devices.
 *   • Detect suspicious logins from new devices.
 *   • Show the user their active device list in the ManageDevices page.
 *
 * FINGERPRINT DESIGN
 * ------------------
 * Signals used (all available without user permission):
 *   • User-Agent string
 *   • Browser language
 *   • Timezone
 *   • Screen resolution + color depth
 *   • Hardware concurrency (CPU cores)
 *   • Device memory (approximate)
 *   • Navigator platform
 *
 * All signals are concatenated and hashed with SHA-256 via SubtleCrypto.
 * The result is stored in localStorage so the same device always produces
 * the same fingerprint across sessions.
 *
 * PRIVACY NOTE
 * ------------
 * No biometric or uniquely identifying data is collected. The fingerprint
 * is a hash — it cannot be reversed to recover the original signals.
 * It is used only for device recognition within the DSMS system.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Call getDeviceInfo() from authStore.login() only — it is already  ║
 * ║      wired up there. No other call site should exist.                  ║
 * ║    • Add new signals to deriveFingerprint() if needed (keep hashing).  ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Call getDeviceInfo() from UI components or pages.                 ║
 * ║    • Store the raw fingerprint anywhere other than localStorage under  ║
 * ║      STORAGE_KEY — it must be consistent across calls.                 ║
 * ║    • Add camera, microphone, or geolocation collection — those require ║
 * ║      user permission and are outside the intended privacy scope.       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

/** localStorage key for the cached device fingerprint. */
const STORAGE_KEY = 'dsms_device_fingerprint'

// ─────────────────────────────────────────────────────────────────────────────
// Fingerprint generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive a compact, stable fingerprint from browser signals using SHA-256.
 * Not cached — use getDeviceFingerprint() for the cached version.
 *
 * @returns {Promise<string>}  64-character lowercase hex string
 */
async function deriveFingerprint() {
    const ua       = navigator.userAgent || ''
    const lang     = navigator.language  || ''
    const tz       = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    const screen   = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
    const cores    = String(navigator.hardwareConcurrency || '')
    const mem      = String(navigator.deviceMemory        || '')
    const platform = navigator.platform || ''

    const raw      = [ua, lang, tz, screen, cores, mem, platform].join('|')
    const encoded  = new TextEncoder().encode(raw)

    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
    const hashArray  = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get a persistent device fingerprint.
 *
 * On the first call: generates the fingerprint via SHA-256 and caches it in
 * localStorage under STORAGE_KEY.
 * On subsequent calls: returns the cached value directly from localStorage,
 * so the fingerprint stays stable even if the browser signals change slightly.
 *
 * Fallback: if SubtleCrypto or localStorage is unavailable (e.g. in some
 * private browsing modes), falls back to a random UUID. The fallback is NOT
 * stable across sessions but still allows the login to proceed.
 *
 * @returns {Promise<string>}
 */
export async function getDeviceFingerprint() {
    try {
        const cached = localStorage.getItem(STORAGE_KEY)
        if (cached) return cached  // stable cached value

        const fingerprint = await deriveFingerprint()
        localStorage.setItem(STORAGE_KEY, fingerprint)
        return fingerprint
    } catch {
        // Fallback for environments where SubtleCrypto or localStorage is unavailable
        const fallback = crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
        try { localStorage.setItem(STORAGE_KEY, fallback) } catch { /* ignore */ }
        return fallback
    }
}

/**
 * Detect the operating system from the User-Agent string.
 * Returns a short human-readable label used for the device list in the UI.
 *
 * @returns {'Android'|'iOS'|'Windows'|'macOS'|'Linux'|'Unknown'}
 */
export function getDeviceOs() {
    const ua = navigator.userAgent
    if (/android/i.test(ua))              return 'Android'
    if (/iphone|ipad|ipod/i.test(ua))    return 'iOS'
    if (/windows nt/i.test(ua))          return 'Windows'
    if (/mac os x/i.test(ua))            return 'macOS'
    if (/linux/i.test(ua))               return 'Linux'
    return 'Unknown'
}

/**
 * Detect the device platform type from the User-Agent string.
 * Returns a short label used for the device list in the UI.
 *
 * @returns {'Tablet'|'Mobile'|'Desktop'}
 */
export function getDevicePlatform() {
    const ua = navigator.userAgent
    if (/tablet|ipad/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return 'Tablet'
    if (/mobile|iphone|ipod|android.*mobile/i.test(ua))                           return 'Mobile'
    return 'Desktop'
}

/**
 * Collect all device metadata required for session registration.
 *
 * Called by authStore.login() before sending the login request.
 * Errors in any sub-call are suppressed non-fatally in authStore so a
 * fingerprinting failure never blocks a legitimate login.
 *
 * @returns {Promise<{ deviceFingerprint: string; deviceOs: string; devicePlatform: string }>}
 */
export async function getDeviceInfo() {
    const [deviceFingerprint, deviceOs, devicePlatform] = await Promise.all([
        getDeviceFingerprint(),
        Promise.resolve(getDeviceOs()),
        Promise.resolve(getDevicePlatform()),
    ])
    return { deviceFingerprint, deviceOs, devicePlatform }
}
