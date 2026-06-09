/**
 * @file ProtectedRoute.jsx
 * @layer MIDDLEWARE — Auth + Authorization enforcement.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ██████╗  █████╗ ███╗   ██╗ ██████╗ ███████╗██████╗
 *  ██╔══██╗██╔══██╗████╗  ██║██╔════╝ ██╔════╝██╔══██╗
 *  ██║  ██║███████║██╔██╗ ██║██║  ███╗█████╗  ██████╔╝
 *  ██║  ██║██╔══██║██║╚██╗██║██║   ██║██╔══╝  ██╔══██╗
 *  ██████╔╝██║  ██║██║ ╚████║╚██████╔╝███████╗██║  ██║
 *  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
 *  RULE: This file is the SINGLE enforcement point for all
 *  protected routes. Do NOT move auth/role logic into page
 *  components. Change auth behavior HERE and only here.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE
 * -------
 * Wrap any <Route> element with <ProtectedRoute> to enforce:
 *  1. Session initialization (wait for localStorage + token refresh to complete)
 *  2. Authentication  (must be logged in)
 *  3. Tenant resolution (tenant must be verified as active — skipped for Super Admin)
 *  4. Role authorization (optional — only routes that pass allowedRoles)
 *
 * USAGE
 * -----
 * Basic (any authenticated user):
 *   <ProtectedRoute>
 *     <SomePage />
 *   </ProtectedRoute>
 *
 * Role-restricted (only Tenant Admin or Branch Manager):
 *   <ProtectedRoute allowedRoles={['Tenant Admin', 'Branch Manager']}>
 *     <AdminPage />
 *   </ProtectedRoute>
 *
 * Resolution pages (skip tenant resolution check so the pipeline can run):
 *   <ProtectedRoute bypassResolutionCheck={true}>
 *     <TenantResolution />
 *   </ProtectedRoute>
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Add new guard steps as numbered comments (Step 5, Step 6…)        ║
 * ║    • Update the UI screens by editing SessionLoadingScreen.jsx or      ║
 * ║      AccessDeniedScreen.jsx — NOT this file.                           ║
 * ║    • Add new allowedRoles checks to route declarations in App.jsx.     ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Inline role or auth logic inside page/UI component files.         ║
 * ║    • Bypass this wrapper by reading authStore directly in a page.      ║
 * ║    • Add window.location.replace() here — use React Router <Navigate>. ║
 * ║    • Remove the isInitialized check — it prevents auth race conditions.║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @param {object}    props
 * @param {ReactNode} props.children              The page/component to render if all checks pass
 * @param {string[]}  [props.allowedRoles]        Whitelist of role strings; omit = any role allowed
 * @param {boolean}   [props.bypassResolutionCheck=false]
 *                                                Skip Step 2.5 tenant-resolution check.
 *                                                ONLY used by the three resolution pages
 *                                                (/resolve-user, /:slug/resolve-tenant, /:slug/role-routing)
 *                                                so they can run BEFORE tenant is verified.
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { buildTenantPath } from '../config/runtime-config'
import { useTenantStore } from '../store/tenantStore'

// Pure UI screens — edit those files to change visuals, not this file
import { SessionLoadingScreen } from './SessionLoadingScreen'
import { AccessDeniedScreen } from './AccessDeniedScreen'

export function ProtectedRoute({ children, allowedRoles, bypassResolutionCheck = false }) {
  const { isAuthenticated, isInitialized, user, logout } = useAuth()

  // Read tenant resolution state from the tenant store.
  // isResolved becomes true only after TenantResolution.jsx has successfully
  // fetched the tenant from the server and confirmed it is active.
  const isResolved = useTenantStore((state) => state.isResolved)

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — Wait for store initialization
  // ─────────────────────────────────────────────────────────────────────────
  // authStore.initStore() is called once in App.jsx on mount. It reads the
  // saved session from localStorage and attempts a background token refresh.
  // Until that completes (isInitialized = true), we cannot trust isAuthenticated
  // because it may not have been set yet. Rendering the spinner here prevents
  // a flash-redirect to /login on page reload.
  if (!isInitialized) {
    return <SessionLoadingScreen />
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — Authentication check
  // ─────────────────────────────────────────────────────────────────────────
  // If the user is not logged in (or the token refresh in Step 1 failed and
  // triggered logout()), redirect them to /login and preserve the intended
  // destination in the ?next= query param so Login.jsx can redirect back.
  if (!isAuthenticated || !user) {
    const nextUrl = window.location.pathname + window.location.search
    return <Navigate to={`/login?next=${encodeURIComponent(nextUrl)}`} replace />
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2.5 — Tenant resolution check
  // ─────────────────────────────────────────────────────────────────────────
  // Non-Super Admin users must go through the resolution pipeline
  // (UserTypeResolution → TenantResolution → RoleRouting) before accessing
  // any protected page. This ensures the tenant is verified as active on
  // every login session, not just once.
  //
  // bypassResolutionCheck = true is set ONLY on the three resolution routes
  // themselves so they can execute before isResolved becomes true.
  // Super Admins skip this entirely — they have no tenant.
  const isSuperAdmin = user.roles?.includes('Super Admin')
  if (!isSuperAdmin && !isResolved && !bypassResolutionCheck) {
    return <Navigate to="/resolve-user" replace />
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3 — Role authorization check
  // ─────────────────────────────────────────────────────────────────────────
  // If the route declares allowedRoles, the user must have at least one
  // matching role. This is a client-side guard — the server enforces the
  // same rules on every API call. Both layers must stay in sync.
  //
  // To add a new role-restricted route:
  //   1. Add the role string to allowedRoles in App.jsx for that route.
  //   2. Make sure the same role check exists on the server endpoint.
  //   3. Do NOT add per-role conditions inside the page component itself.
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || []
    const hasPermission = userRoles.some(role => allowedRoles.includes(role))

    if (!hasPermission) {
      return (
        <AccessDeniedScreen
          userRoles={userRoles}
          dashboardPath={buildTenantPath(user?.tenantId, '/dashboard')}
          onLogout={logout}
        />
      )
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4 — All checks passed → render the protected page
  // ─────────────────────────────────────────────────────────────────────────
  return children
}

export default ProtectedRoute
