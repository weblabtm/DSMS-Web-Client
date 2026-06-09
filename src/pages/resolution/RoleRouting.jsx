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

    // Log the routing decision in development to aid debugging.
    // Remove or guard with import.meta.env.DEV if needed.
    console.log(`[RoleRouting] plan=${plan}, role=${userRole}, features=${JSON.stringify(featureFlags)} → ${targetPath}`)

    hideLoader()
    navigate(targetPath, { replace: true })
  }, [user, tenant, tenantSlug, navigate, showLoader, hideLoader])

  // This component intentionally renders nothing visible.
  // The global loader overlay (GlobalLoader.jsx) shows the loading message.
  return <div className="min-h-screen bg-slate-950" />
}
