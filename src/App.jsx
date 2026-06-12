/**
 * @file App.jsx
 * @layer MIDDLEWARE — Root application router. Declares all routes and inline
 *                    guards (PublicRoute, TenantDashboardEntry).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR ALL ROUTES.
 *  ADD AND REMOVE ROUTES ONLY HERE — NOT INSIDE PAGE COMPONENTS.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * STRUCTURE OVERVIEW
 * ------------------
 * App
 *  ├─ useEffect → authStore.initStore()     (boot rehydration)
 *  ├─ !isInitialized → full-screen loader   (prevents flash-redirect on reload)
 *  └─ BrowserRouter
 *       ├─ GlobalLoader                     (full-screen overlay used by resolution pages)
 *       └─ Routes
 *            ├─ Public routes   wrapped in <PublicRoute>
 *            ├─ Resolution routes wrapped in <ProtectedRoute bypassResolutionCheck>
 *            ├─ Tenant dashboard  wrapped in <ProtectedRoute>
 *            └─ Super Admin dashboard  wrapped in <ProtectedRoute allowedRoles=['Super Admin']>
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Add new pages by importing the component and adding a <Route>     ║
 * ║      with the appropriate guard (ProtectedRoute / PublicRoute).        ║
 * ║    • Restrict new routes by role using allowedRoles on ProtectedRoute. ║
 * ║    • Keep PublicRoute and TenantDashboardEntry as inline components    ║
 * ║      in this file — they are routing middleware, not standalone pages. ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Add page UI or business logic to this file.                       ║
 * ║    • Access authStore or tenantStore directly from page components.    ║
 * ║    • Move initStore() out of the App component — it must run exactly   ║
 * ║      once on the root mount.                                           ║
 * ║    • Remove the !isInitialized early-return loader — without it users  ║
 * ║      see a flash-redirect to /login on every page reload.              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from './shared/store/authStore'
import { buildTenantPath } from './shared/config/runtime-config.js'

// ── Page imports ──────────────────────────────────────────────────────────────
import Landing from './pages/Landing.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import Otp from './pages/auth/Otp.jsx'
import Challenge from './pages/auth/Challenge.jsx'
import PasswordResetRequest from './pages/auth/PasswordResetRequest.jsx'
import PasswordResetVerify from './pages/auth/PasswordResetVerify.jsx'
import PasswordResetSetPassword from './pages/auth/PasswordResetSetPassword.jsx'
import TenantDashboard from './pages/dashboard/TenantDashboard.jsx'
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard.jsx'
import ManageDevices from './pages/settings/ManageDevices.jsx'

// ── Resolution pipeline pages (Step 1 → 2 → 3 of post-login routing) ─────────
import UserTypeResolution from './pages/resolution/UserTypeResolution.jsx'   // Step 1
import TenantResolution from './pages/resolution/TenantResolution.jsx'       // Step 2
import RoleRouting from './pages/resolution/RoleRouting.jsx'                 // Step 3
import TenantError from './pages/resolution/TenantError.jsx'

// ── Auth / UI guards ──────────────────────────────────────────────────────────
import ProtectedRoute from './shared/ui/ProtectedRoute.jsx'
import GlobalLoader from './shared/ui/GlobalLoader.jsx'
import { useTenantStore } from './shared/store/tenantStore'

// ─────────────────────────────────────────────────────────────────────────────
// PublicRoute
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps public pages (Login, Register, OTP, etc.) to prevent authenticated
 * users from accessing them. If the user is already logged in, they are
 * redirected to their appropriate dashboard.
 *
 * EXCEPTION — MFA callback:
 *   When Login.jsx is processing an OTP or CAPTCHA callback (?otpDone or
 *   ?captchaDone query params), it needs to call completeLogin() before
 *   a new session is issued. We must NOT redirect away in that window,
 *   otherwise the MFA flow breaks. The hasMfaCallback flag bypasses the
 *   redirect for this case only.
 *
 * ⚠️  AGENT WARNING: Do NOT add auth logic to individual public pages.
 *     All "redirect if already logged in" logic lives HERE.
 *
 * Redirect decision tree:
 *   Already authenticated AND not on MFA callback?
 *     ├─ Super Admin     → /super-admin/dashboard
 *     ├─ Tenant resolved → /:tenantSlug/dashboard
 *     └─ Not resolved    → /resolve-user   (triggers resolution pipeline)
 *   Not authenticated    → render the public page (children)
 */
function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentUser     = useAuthStore((state) => state.user)
  const isResolved      = useTenantStore((state) => state.isResolved)
  const currentRole     = currentUser?.roles?.[0] ?? null

  // Check for MFA completion callbacks — Login.jsx must stay visible to run completeLogin()
  const params         = new URLSearchParams(window.location.search)
  const hasMfaCallback = params.has('otpDone') || params.has('captchaDone')

  if (!hasMfaCallback && isAuthenticated && currentUser) {
    if (currentRole === 'Super Admin') {
      return <Navigate to="/super-admin/dashboard" replace />
    }
    if (isResolved) {
      const currentTenantSlug = currentUser?.tenantId?.trim()
      const target = currentTenantSlug
        ? buildTenantPath(currentTenantSlug, '/dashboard')
        : '/dashboard'
      return <Navigate to={target} replace />
    } else {
      // Tenant not yet verified this session — run resolution pipeline
      return <Navigate to="/resolve-user" replace />
    }
  }

  return children
}

// ─────────────────────────────────────────────────────────────────────────────
// TenantDashboardEntry
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Final URL-vs-session cross-check before rendering <TenantDashboard />.
 * This is the last line of defense against a user accessing another tenant's
 * URL by editing the address bar.
 *
 * All four cases:
 *   1. Super Admin hits /dashboard (no slug)  → /super-admin/dashboard
 *   2. URL slug ≠ user's tenantId             → /:correctSlug/dashboard  (tenant-hop prevention)
 *   3. User has a tenantId but URL has none   → /:tenantSlug/dashboard
 *   4. All checks pass                        → render <TenantDashboard />
 *
 * ⚠️  AGENT WARNING: Do NOT remove cases 2 and 3 as an "optimisation."
 *     Case 2 prevents cross-tenant URL hijacking.
 *     Case 3 prevents the generic /dashboard route from showing a blank page.
 */
function TenantDashboardEntry() {
  const currentUser    = useAuthStore((state) => state.user)
  const currentRole    = useAuthStore((state) => state.user?.roles?.[0] ?? null)
  const { tenantSlug } = useParams()

  const currentTenantSlug = currentUser?.tenantId?.trim()
  const routeTenantSlug   = tenantSlug?.trim() || null

  // Case 1: Super Admin on /dashboard (no tenant slug in URL)
  if (!routeTenantSlug && currentRole === 'Super Admin') {
    return <Navigate to="/super-admin/dashboard" replace />
  }

  // Case 2: URL slug does not match the user's tenant — redirect to correct tenant
  // Prevents a user from accessing /:otherTenant/dashboard by editing the URL
  if (routeTenantSlug && currentRole !== 'Super Admin' && currentTenantSlug && routeTenantSlug !== currentTenantSlug) {
    return <Navigate to={`/${currentTenantSlug}/dashboard`} replace />
  }

  // Case 3: User has a tenant but the URL has no slug (hit /dashboard directly)
  if (currentTenantSlug && !routeTenantSlug) {
    return <Navigate to={`/${currentTenantSlug}/dashboard`} replace />
  }

  // Case 4: All checks passed — render the dashboard
  return <TenantDashboard />
}

// ─────────────────────────────────────────────────────────────────────────────
// App — Root component
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const initStore     = useAuthStore((state) => state.initStore)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  // Trigger session rehydration exactly once on app mount.
  // initStore() reads localStorage, then silently refreshes the token.
  // ⚠️  AGENT WARNING: Do NOT move this call elsewhere or add more useEffects
  //     that call initStore(). It must run exactly once on the root component.
  useEffect(() => {
    initStore()
  }, [initStore])

  // Full-screen loader while initStore() is running.
  // Without this, ProtectedRoute would flash a redirect to /login on every
  // page reload (because isAuthenticated starts as false before localStorage is read).
  if (!isInitialized) {
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
              Initializing application...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* GlobalLoader renders the full-screen overlay used by the resolution pipeline */}
      <AnimatePresence mode="wait">
        <GlobalLoader />
      </AnimatePresence>

      <BrowserRouter>
        <Routes>

          {/* ── Public routes ─────────────────────────────────────────────────
              Wrapped in PublicRoute so authenticated users are redirected away.
              Add new public pages here with <PublicRoute> wrapper.
          ──────────────────────────────────────────────────────────────────── */}
          <Route path="/"                        element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login"                   element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"                element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/otp"                     element={<PublicRoute><Otp /></PublicRoute>} />
          <Route path="/challenge"               element={<PublicRoute><Challenge /></PublicRoute>} />
          <Route path="/resetPassword/request"   element={<PublicRoute><PasswordResetRequest /></PublicRoute>} />
          <Route path="/resetPassword/verify"    element={<PublicRoute><PasswordResetVerify /></PublicRoute>} />
          <Route path="/resetPassword/set-password" element={<PublicRoute><PasswordResetSetPassword /></PublicRoute>} />

          {/* ── Resolution pipeline ───────────────────────────────────────────
              bypassResolutionCheck=true is REQUIRED on all three steps so the
              pipeline can run before tenantStore.isResolved becomes true.
              DO NOT remove that prop or the pipeline will loop back to itself.
          ──────────────────────────────────────────────────────────────────── */}
          <Route
            path="/resolve-user"
            element={
              <ProtectedRoute bypassResolutionCheck={true}>
                <UserTypeResolution />   {/* Step 1 */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/:tenantSlug/resolve-tenant"
            element={
              <ProtectedRoute bypassResolutionCheck={true}>
                <TenantResolution />     {/* Step 2 — live server check */}
              </ProtectedRoute>
            }
          />
          <Route
            path="/:tenantSlug/role-routing"
            element={
              <ProtectedRoute bypassResolutionCheck={true}>
                <RoleRouting />          {/* Step 3 — role + plan based routing */}
              </ProtectedRoute>
            }
          />
          {/* TenantError is public — no auth needed, user may be logged out */}
          <Route path="/tenant-error" element={<TenantError />} />

          {/* ── Tenant dashboard ──────────────────────────────────────────────
              /dashboard is a fallback for cases where tenantSlug is missing.
              TenantDashboardEntry handles the slug cross-check internally.
              No allowedRoles = any authenticated + resolved user can access.
          ──────────────────────────────────────────────────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <TenantDashboardEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:tenantSlug/dashboard"
            element={
              <ProtectedRoute>
                <TenantDashboardEntry />
              </ProtectedRoute>
            }
          />

          {/* ── Super Admin dashboard ─────────────────────────────────────────
              Strictly role-gated. Any non-Super Admin who reaches this URL
              gets the AccessDeniedScreen from ProtectedRoute.
          ──────────────────────────────────────────────────────────────────── */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Settings ─────────────────────────────────────────────────────
              Add new settings routes here. Wrap with ProtectedRoute and
              allowedRoles as needed.
          ──────────────────────────────────────────────────────────────────── */}
          <Route path="/settings/devices" element={<ProtectedRoute><ManageDevices /></ProtectedRoute>} />

          {/* ── Catch-all ────────────────────────────────────────────────────
              Any unmatched URL redirects to the landing page.
          ──────────────────────────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
