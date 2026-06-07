import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuthStore } from './shared/store/authStore'

// Pages
import Landing from './pages/Landing.jsx'
import Login from './pages/auth/Login.jsx'
import Register from './pages/Register.jsx'
import PasswordResetRequest from './pages/auth/PasswordResetRequest.jsx'
import PasswordResetConfirm from './pages/auth/PasswordResetConfirm.jsx'
import TenantDashboard from './pages/dashboard/TenantDashboard.jsx'
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard.jsx'

// UI Guards
import ProtectedRoute from './shared/ui/ProtectedRoute.jsx'

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
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-lg shadow-indigo-500/20" />
          <p className="text-sm font-semibold tracking-wide text-slate-400">Deploying control nodes...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/password-reset/request" element={<PasswordResetRequest />} />
        <Route path="/auth/password-reset/confirm" element={<PasswordResetConfirm />} />

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
  )
}

export default App

