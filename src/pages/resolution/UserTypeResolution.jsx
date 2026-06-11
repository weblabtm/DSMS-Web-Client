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

  // This component intentionally renders nothing visible.
  // The global loader overlay (GlobalLoader.jsx) shows the loading message.
  return <div className="min-h-screen bg-slate-950" />
}
