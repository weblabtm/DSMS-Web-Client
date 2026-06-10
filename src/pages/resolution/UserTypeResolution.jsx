/**
 * @file UserTypeResolution.jsx
 * @layer MIDDLEWARE — Post-login routing decision. Minimal UI (blank screen only).
 *
 * PURPOSE
 * -------
 * Step 1 of the 3-step post-login resolution pipeline.
 * Decides where to send the user immediately after authentication,
 * based on their role:
 *
 *   Super Admin  →  /super-admin/dashboard   (bypasses tenant pipeline)
 *   All others   →  /:tenantSlug/resolve-tenant  (continues to Step 2)
 *   No tenantId  →  /tenant-error?type=not-found
 *   No user      →  /login
 *
 * WHEN DOES THIS PAGE RENDER?
 * ---------------------------
 * • After a successful login — authStore.login() resolves, the calling page
 *   navigates to /resolve-user.
 * • On page reload — ProtectedRoute.jsx redirects here when isResolved is
 *   false (tenant has not been verified this session yet).
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Add new role-based forks here (e.g. a 'Guest' role that goes to  ║
 * ║      a different path) as new if/else branches inside the useEffect.   ║
 * ║    • Keep the loading UX changes in GlobalLoader / uiStore only.       ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Add any form, modal, or visual content here. This page should     ║
 * ║      remain invisible (just the dark background + global loader).      ║
 * ║    • Put tenant verification logic here — that belongs in              ║
 * ║      TenantResolution.jsx (Step 2).                                    ║
 * ║    • Navigate directly to the dashboard from here — always go through  ║
 * ║      TenantResolution first so the tenant active check runs.           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * PIPELINE SEQUENCE
 * -----------------
 * /resolve-user  (THIS FILE — Step 1)
 *      ↓
 * /:tenantSlug/resolve-tenant  (TenantResolution.jsx — Step 2)
 *      ↓
 * /:tenantSlug/role-routing    (RoleRouting.jsx — Step 3)
 *      ↓
 * /:tenantSlug/dashboard
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../shared/hooks/useAuth'
import { useUiStore } from '../../shared/store/uiStore'

export default function UserTypeResolution() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const showLoader = useUiStore((state) => state.showLoader)
  const hideLoader = useUiStore((state) => state.hideLoader)

  useEffect(() => {
    showLoader('Resolving user profile...')

    // Guard: no user in store → session was lost, go to login
    if (!user) {
      hideLoader()
      navigate('/login', { replace: true })
      return
    }

    const isSuperAdmin = user.roles?.includes('Super Admin')

    if (isSuperAdmin) {
      // Super Admins have no tenant — skip the tenant pipeline entirely
      hideLoader()
      navigate('/super-admin/dashboard', { replace: true })
    } else {
      // tenantId is stored as the slug in the session (matches the URL segment)
      const tenantSlug = user.tenantId
      if (tenantSlug) {
        // Continue to Step 2: TenantResolution verifies the tenant is active
        hideLoader()
        navigate(`/${encodeURIComponent(tenantSlug)}/resolve-tenant`, { replace: true })
      } else {
        // User has no associated tenant — configuration error or deleted tenant
        hideLoader()
        navigate('/tenant-error?type=not-found', { replace: true })
      }
    }
  }, [user, navigate, showLoader, hideLoader])

  // Custom green buffering animation rendered natively on the page
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#041208] overflow-hidden select-none font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Ambient background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-[#52b788]/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[#1a472a]/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 p-6 text-center max-w-sm">
        {/* Animated Custom Ring Spinner */}
        <div className="relative flex items-center justify-center">
          {/* Inner pulsing core */}
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute h-6 w-6 rounded-full bg-gradient-to-tr from-[#1a472a] to-[#52b788] shadow-lg shadow-[#52b788]/50"
          />
          {/* Middle rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="h-16 w-16 rounded-full border-4 border-white/5 border-t-[#52b788] border-r-[#d8f3dc] shadow-md shadow-[#52b788]/10"
          />
          {/* Outer glowing halo */}
          <div className="absolute h-20 w-20 rounded-full border-2 border-[#52b788]/5 animate-pulse" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-[#d8f3dc] to-[#52b788] bg-clip-text text-transparent">
            Please Wait
          </h3>
          <p className="text-sm font-medium leading-relaxed text-[#d8f3dc]/80 tracking-wide animate-pulse">
            Resolving user profile...
          </p>
        </div>
      </div>
    </div>
  )
}
