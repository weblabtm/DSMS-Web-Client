/**
 * @file SessionLoadingScreen.jsx
 * @layer UI — Pure presentational component. No auth logic lives here.
 *
 * PURPOSE
 * -------
 * Shown by ProtectedRoute while authStore.isInitialized is false (i.e. the app
 * is still checking localStorage and running the background token refresh).
 *
 * ╔══════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULE                                  ║
 * ║  You may freely change the visual design of this file.  ║
 * ║  Do NOT add any auth logic, redirects, or store reads.  ║
 * ║  The decision to show this screen lives in              ║
 * ║  ProtectedRoute.jsx — change it there, not here.        ║
 * ╚══════════════════════════════════════════════════════════╝
 */

export function SessionLoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 overflow-hidden">
      {/* Ambient glow — purely decorative */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-lg shadow-indigo-500/20" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Verifying session...</p>
      </div>
    </div>
  )
}

export default SessionLoadingScreen
