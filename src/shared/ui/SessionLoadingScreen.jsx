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
    <div className="relative flex min-h-screen items-center justify-center bg-[#f4f6f4] overflow-hidden p-6 select-none font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Ambient glow — purely decorative */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 bg-[#52b788]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 bg-white rounded-[24px] p-8 md:p-10 shadow-sm border border-gray-200/50 flex flex-col items-center gap-6 max-w-sm w-full text-center">
        {/* Spinner revolving around the Donezo logo */}
        <div className="relative flex items-center justify-center h-16 w-16">
          {/* Centered Donezo Logo */}
          <div className="absolute animate-pulse">
            <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
                stroke="#1a472a"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 14C10 11.5 12 11.5 13.5 13.5C15 15.5 16 15.5 16 15.5C16 15.5 17 15.5 18.5 13.5C20 11.5 22 11.5 22 14C22 18.5 16 22 16 22C16 22 10 18.5 10 14Z"
                stroke="#1a472a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Spinning Ring */}
          <div className="absolute h-14 w-14 animate-spin rounded-full border-4 border-gray-100 border-t-[#1a472a] border-r-[#52b788] shadow-sm" />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h4 className="text-base font-bold text-gray-900 tracking-tight">Initializing Session</h4>
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    </div>
  )
}

export default SessionLoadingScreen
