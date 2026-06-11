/**
 * @file TenantResolution.jsx
 * @layer MIDDLEWARE — Server-verified tenant status check. Minimal UI (blank screen only).
 *
 * PURPOSE
 * -------
 * Step 2 of the 3-step post-login resolution pipeline.
 * Makes a live server call to verify the tenant (school) is still active.
 * This is the SECURITY checkpoint — a suspended school's users are blocked here
 * on every login, not just when they first registered.
 *
 * On success:  stores the tenant object in tenantStore (isResolved → true)
 *              then navigates to Step 3 (RoleRouting).
 * On failure:  navigates to /tenant-error with the reason (not-found | suspended).
 *
 * WHY A SERVER CALL HERE?
 * -----------------------
 * The tenant's active status is not stored in the JWT. A school may be suspended
 * after the user's last login. By calling the server on every new session, we
 * guarantee that suspended-school users are blocked immediately, without waiting
 * for their token to expire.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Add additional tenant-level checks here (e.g. plan expiry,        ║
 * ║      maintenance mode) as extra conditions after the isActive check.   ║
 * ║    • Add new /tenant-error?type=... cases in TenantError.jsx if you    ║
 * ║      add new failure modes here.                                        ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Skip or short-circuit this step to "save an API call." It is a   ║
 * ║      security verification, not an optimisation target.                ║
 * ║    • Navigate directly to the dashboard from here — always go through  ║
 * ║      RoleRouting (Step 3) so role/plan-based routing can run.          ║
 * ║    • Set isResolved = true anywhere else in the codebase.              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * PIPELINE SEQUENCE
 * -----------------
 * /resolve-user                (UserTypeResolution.jsx — Step 1)
 *      ↓
 * /:tenantSlug/resolve-tenant  (THIS FILE — Step 2)
 *      ↓
 * /:tenantSlug/role-routing    (RoleRouting.jsx — Step 3)
 *      ↓
 * /:tenantSlug/dashboard
 */

import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { dsmsApi } from '../../shared/api/dsms-api'
import { useTenantStore } from '../../shared/store/tenantStore'
import { useUiStore } from '../../shared/store/uiStore'

export default function TenantResolution() {
  const { tenantSlug } = useParams()
  const navigate = useNavigate()
  const setTenant = useTenantStore((state) => state.setTenant)
  const showLoader = useUiStore((state) => state.showLoader)
  const hideLoader = useUiStore((state) => state.hideLoader)

  useEffect(() => {
    // active flag prevents setState calls on an unmounted component
    // (React will log a warning otherwise if the user navigates away quickly)
    let active = true
    showLoader('Verifying school status...')

    const verifyTenant = async () => {
      try {
        if (!tenantSlug) {
          throw new Error('Tenant slug is missing from the URL')
        }

        // ── SECURITY CHECK ─────────────────────────────────────────────
        // Live server call. The server checks:
        //   1. Tenant exists in the database.
        //   2. tenant.isActive === true.
        // If either fails, the server returns 404 or the tenant object
        // has isActive = false.
        const tenant = await dsmsApi.getTenantBySlug(tenantSlug)

        if (!active) return // component unmounted — discard result

        if (tenant && tenant.isActive) {
          // ✅ Tenant is active — persist to store and continue pipeline
          // Setting the tenant here marks isResolved = true in tenantStore,
          // which ProtectedRoute uses to allow dashboard access.
          setTenant(tenant)
          hideLoader()
          navigate(`/${encodeURIComponent(tenantSlug)}/role-routing`, { replace: true })
        } else {
          // ❌ Tenant exists but has been suspended
          hideLoader()
          navigate(`/tenant-error?type=suspended&slug=${encodeURIComponent(tenantSlug)}`, { replace: true })
        }
      } catch {
        if (!active) return
        // ❌ Network error or 404 — tenant not found
        hideLoader()
        navigate(`/tenant-error?type=not-found&slug=${encodeURIComponent(tenantSlug || '')}`, { replace: true })
      }
    }

    verifyTenant()

    // Cleanup: mark this effect instance as stale on unmount
    return () => {
      active = false
    }
  }, [tenantSlug, navigate, setTenant, showLoader, hideLoader])

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
            Verifying school status...
          </p>
        </div>
      </div>
    </div>
  )
}
