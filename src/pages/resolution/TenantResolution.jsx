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

  // This component intentionally renders nothing visible.
  // The global loader overlay (GlobalLoader.jsx) shows the loading message.
  return <div className="min-h-screen bg-slate-950" />
}
