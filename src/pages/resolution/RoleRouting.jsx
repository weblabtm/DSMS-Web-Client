/**
 * @file RoleRouting.jsx
 * @layer MIDDLEWARE — Role + plan aware final routing. Minimal UI (blank screen only).
 *
 * PURPOSE
 * -------
 * Step 3 (final step) of the 3-step post-login resolution pipeline.
 * Reads the user's role, the tenant's subscription plan, and the tenant's
 * feature flags, then decides which dashboard URL to send the user to.
 *
 * Currently all roles land on /:tenantSlug/dashboard. This file is the
 * designated place to add per-role routing in the future (e.g. sending
 * Instructors to /instructor/dashboard vs Students to /student/dashboard).
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Add new role → path mappings HERE (not in UserTypeResolution or   ║
 * ║      TenantResolution). That keeps routing logic in one place.         ║
 * ║    • Use tenant.featureFlags to conditionally route to feature-gated   ║
 * ║      dashboard variants when those pages exist.                        ║
 * ║    • Use tenant.plan to restrict access based on subscription tier.    ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Add any UI, forms, or visible content here.                       ║
 * ║    • Re-verify the tenant here — that already happened in Step 2.      ║
 * ║    • Remove the !user guard — it protects against race conditions      ║
 * ║      where the user logs out during the pipeline.                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * EXTENDING ROLE-BASED ROUTING (example)
 * ---------------------------------------
 * To send students to a dedicated student dashboard:
 *
 *   if (userRole === 'Student') {
 *     targetPath = `/${encodeURIComponent(tenantSlug)}/student/dashboard`
 *   } else if (userRole === 'Instructor') {
 *     targetPath = `/${encodeURIComponent(tenantSlug)}/instructor/dashboard`
 *   }
 *
 * Then add the corresponding protected routes in App.jsx.
 *
 * PIPELINE SEQUENCE
 * -----------------
 * /resolve-user                (UserTypeResolution.jsx — Step 1)
 *      ↓
 * /:tenantSlug/resolve-tenant  (TenantResolution.jsx — Step 2)
 *      ↓
 * /:tenantSlug/role-routing    (THIS FILE — Step 3)
 *      ↓
 * /:tenantSlug/dashboard  (or a role-specific path in the future)
 */

import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../shared/hooks/useAuth'
import { useTenantStore } from '../../shared/store/tenantStore'
import { useUiStore } from '../../shared/store/uiStore'

export default function RoleRouting() {
  const { tenantSlug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // tenant was set by TenantResolution (Step 2) and contains plan + featureFlags
  const tenant = useTenantStore((state) => state.tenant)
  const showLoader = useUiStore((state) => state.showLoader)
  const hideLoader = useUiStore((state) => state.hideLoader)

  useEffect(() => {
    showLoader('Routing to workspace...')

    // Guard: if user somehow disappeared during the pipeline, restart auth flow
    if (!user) {
      hideLoader()
      navigate('/login', { replace: true })
      return
    }

    // ── Routing inputs ────────────────────────────────────────────────────
    const plan         = tenant?.plan         || 'Standard'
    const featureFlags = tenant?.featureFlags || []
    const userRole     = user.roles?.[0]      || 'Student'

    // ── Route decision ────────────────────────────────────────────────────
    // TODO: Add per-role or per-plan paths here when new dashboards are built.
    // Example structure to follow:
    //   if (userRole === 'Student') targetPath = `/${tenantSlug}/student/dashboard`
    let targetPath = `/${encodeURIComponent(tenantSlug)}/dashboard`

    hideLoader()
    navigate(targetPath, { replace: true })
  }, [user, tenant, tenantSlug, navigate, showLoader, hideLoader])

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
            Routing to workspace...
          </p>
        </div>
      </div>
    </div>
  )
}
