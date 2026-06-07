import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from './shared/store/authStore'

import { buildBaseHostUrl, buildTenantPath } from './shared/config/runtime-config.js'

// Pages
import Landing from './pages/Landing.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/Register.jsx'
import Otp from './pages/auth/Otp.jsx'
import Challenge from './pages/auth/Challenge.jsx'
import PasswordResetRequest from './pages/auth/PasswordResetRequest.jsx'
import PasswordResetVerify from './pages/auth/PasswordResetVerify.jsx'
import PasswordResetSetPassword from './pages/auth/PasswordResetSetPassword.jsx'
import TenantDashboard from './pages/dashboard/TenantDashboard.jsx'
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard.jsx'

// Resolution Pages
import UserTypeResolution from './pages/resolution/UserTypeResolution.jsx'
import TenantResolution from './pages/resolution/TenantResolution.jsx'
import RoleRouting from './pages/resolution/RoleRouting.jsx'
import TenantError from './pages/resolution/TenantError.jsx'
import { useTenantStore } from './shared/store/tenantStore'

// UI Guards
import ProtectedRoute from './shared/ui/ProtectedRoute.jsx'
import GlobalLoader from './shared/ui/GlobalLoader.jsx'

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentUser = useAuthStore((state) => state.user)
  const isResolved = useTenantStore((state) => state.isResolved)
  const currentRole = currentUser?.roles?.[0] ?? null

  // If Login is handling an MFA callback it must run completeLogin() first —
  // don't let a stale session redirect us away before the new session is issued.
  const params = new URLSearchParams(window.location.search)
  const hasMfaCallback = params.has('otpDone') || params.has('captchaDone')

  if (!hasMfaCallback && isAuthenticated && currentUser) {
    if (currentRole === 'Super Admin') {
      return <Navigate to="/super-admin/dashboard" replace />
    }
    // If tenant status has been verified/resolved, go to dashboard.
    // Otherwise, force resolution checking.
    if (isResolved) {
      const currentTenantSlug = currentUser?.tenantId?.trim()
      const target = currentTenantSlug ? buildTenantPath(currentTenantSlug, '/dashboard') : '/dashboard'
      return <Navigate to={target} replace />
    } else {
      return <Navigate to="/resolve-user" replace />
    }
  }

  return children
}

function TenantDashboardEntry() {
  const currentUser = useAuthStore((state) => state.user)
  const currentRole = useAuthStore((state) => state.user?.roles?.[0] ?? null)
  const { tenantSlug } = useParams()

  const currentTenantSlug = currentUser?.tenantId?.trim()
  const routeTenantSlug = tenantSlug?.trim() || null

  if (!routeTenantSlug && currentRole === 'Super Admin') {
    return <Navigate to="/super-admin/dashboard" replace />
  }

  if (routeTenantSlug && currentRole !== 'Super Admin' && currentTenantSlug && routeTenantSlug !== currentTenantSlug) {
    return <Navigate to={`/${currentTenantSlug}/dashboard`} replace />
  }

  if (currentTenantSlug && !routeTenantSlug) {
    return <Navigate to={`/${currentTenantSlug}/dashboard`} replace />
  }

  return <TenantDashboard />
}

function App() {
  const initStore = useAuthStore((state) => state.initStore)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  // Trigger boot rehydration
  useEffect(() => {
    initStore()
  }, [initStore])

  // Full screen rehydration loader
  if (!isInitialized) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 overflow-hidden">
        {/* Ambient background glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-indigo-600/15 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 p-6 text-center max-w-sm">
          <div className="relative flex items-center justify-center">
            {/* Inner pulsing core */}
            <motion.div 
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/50" 
            />
            {/* Middle rotating ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="h-16 w-16 rounded-full border-4 border-slate-900 border-t-indigo-500 border-r-blue-400 shadow-md shadow-indigo-500/10"
            />
            {/* Outer glowing halo */}
            <div className="absolute h-20 w-20 rounded-full border-2 border-indigo-500/5 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Please Wait
            </h3>
            <p className="text-sm font-medium leading-relaxed text-slate-400 tracking-wide animate-pulse">
              Deploying control nodes...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <GlobalLoader />
      </AnimatePresence>
      <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/otp" element={<PublicRoute><Otp /></PublicRoute>} />
        <Route path="/challenge" element={<PublicRoute><Challenge /></PublicRoute>} />
        <Route path="/resetPassword/request" element={<PublicRoute><PasswordResetRequest /></PublicRoute>} />
        <Route path="/resetPassword/verify" element={<PublicRoute><PasswordResetVerify /></PublicRoute>} />
        <Route path="/resetPassword/set-password" element={<PublicRoute><PasswordResetSetPassword /></PublicRoute>} />

        {/* Resolution Flow Routes */}
        <Route
          path="/resolve-user"
          element={
            <ProtectedRoute bypassResolutionCheck={true}>
              <UserTypeResolution />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:tenantSlug/resolve-tenant"
          element={
            <ProtectedRoute bypassResolutionCheck={true}>
              <TenantResolution />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:tenantSlug/role-routing"
          element={
            <ProtectedRoute bypassResolutionCheck={true}>
              <RoleRouting />
            </ProtectedRoute>
          }
        />
        <Route path="/tenant-error" element={<TenantError />} />

        {/* Tenant Dashboard Route */}
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

        {/* Super Admin Dashboard Route */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Super Admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

