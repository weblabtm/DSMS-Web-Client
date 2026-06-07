/**
 * deviceInfo.js
 * Collects a stable device fingerprint, OS, and platform using only
 * browser-standard APIs (no third-party dependencies).
 *
 * The fingerprint is stored in localStorage so it stays stable across
 * sessions on the same device.
 */

const STORAGE_KEY = 'dsms_device_fingerprint';

/**
 * Derive a compact fingerprint from browser signals.
 * We hash the concatenated signals using SubtleCrypto (SHA-256).
 * @returns {Promise<string>} hex fingerprint
 */
async function deriveFingerprint() {
    const ua = navigator.userAgent || '';
    const lang = navigator.language || '';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const cores = String(navigator.hardwareConcurrency || '');
    const mem = String(navigator.deviceMemory || '');
    const platform = navigator.platform || '';

    const raw = [ua, lang, tz, screen, cores, mem, platform].join('|');
    const encoded = new TextEncoder().encode(raw);

    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Returns a persistent device fingerprint.
 * Generates and caches on first call; subsequent calls read from localStorage.
 * @returns {Promise<string>}
 */
export async function getDeviceFingerprint() {
    try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) return cached;

        const fingerprint = await deriveFingerprint();
        localStorage.setItem(STORAGE_KEY, fingerprint);
        return fingerprint;
    } catch {
        // Fallback: random UUID if SubtleCrypto or localStorage is unavailable
        const fallback = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
        try { localStorage.setItem(STORAGE_KEY, fallback); } catch { /* ignore */ }
        return fallback;
    }
}

/**
 * Detects the operating system from the User-Agent string.
 * @returns {string}
 */
export function getDeviceOs() {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    if (/windows nt/i.test(ua)) return 'Windows';
    if (/mac os x/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Unknown';
}

/**
 * Detects the platform type (Web, Mobile, Tablet, Desktop).
 * @returns {string}
 */
export function getDevicePlatform() {
    const ua = navigator.userAgent;
    if (/tablet|ipad/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return 'Tablet';
    if (/mobile|iphone|ipod|android.*mobile/i.test(ua)) return 'Mobile';
    return 'Desktop';
}

/**
 * Returns all device metadata needed for session registration.
 * @returns {Promise<{ deviceFingerprint: string, deviceOs: string, devicePlatform: string }>}
 */
export async function getDeviceInfo() {
    const [deviceFingerprint, deviceOs, devicePlatform] = await Promise.all([
        getDeviceFingerprint(),
        Promise.resolve(getDeviceOs()),
        Promise.resolve(getDevicePlatform()),
    ]);
    return { deviceFingerprint, deviceOs, devicePlatform };
}
