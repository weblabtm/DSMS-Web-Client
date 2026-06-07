import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './button'
import { buildBaseHostUrl, buildTenantPath } from '../config/runtime-config'
import { useTenantStore } from '../store/tenantStore'

export function ProtectedRoute({ children, allowedRoles, bypassResolutionCheck = false }) {
  const { isAuthenticated, isInitialized, user, logout } = useAuth()
  const isResolved = useTenantStore((state) => state.isResolved)

  // 1. Wait for store initialization (localStorage check + background refresh)
  if (!isInitialized) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 overflow-hidden">
        {/* Glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 bg-indigo-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-lg shadow-indigo-500/20" />
          <p className="text-sm font-semibold tracking-wide text-slate-400">Verifying session...</p>
        </div>
      </div>
    )
  }

  // 2. Redirect to /login if unauthenticated — use React Router Navigate (no hard reload)
  if (!isAuthenticated || !user) {
    const nextUrl = window.location.pathname + window.location.search
    return <Navigate to={`/login?next=${encodeURIComponent(nextUrl)}`} replace />
  }

  // 2.5. Enforce tenant resolution for non-Super Admin users
  const isSuperAdmin = user.roles?.includes('Super Admin')
  if (!isSuperAdmin && !isResolved && !bypassResolutionCheck) {
    return <Navigate to="/resolve-user" replace />
  }


  // 3. Role verification (if roles are restricted)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || []
    const hasPermission = userRoles.some(role => allowedRoles.includes(role))

    if (!hasPermission) {
      return (
        <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 px-4">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px]" />
          </div>

          <div className="w-full max-w-md rounded-2xl border border-slate-900 bg-slate-900/40 p-8 text-center backdrop-blur-xl shadow-2xl shadow-red-950/10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10 border border-red-500/20">
              <ShieldAlert className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Access Denied
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Your account role <span className="font-semibold text-slate-200">({userRoles.join(', ')})</span> does not have authorization to view this area. Please contact your system administrator.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Button asChild variant="default" className="w-full">
                <Link to={buildTenantPath(user?.tenantId, '/dashboard')} className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Go to Dashboard
                </Link>
              </Button>

              <Button onClick={() => logout()} variant="outline" className="w-full border-red-900/30 text-red-400 hover:bg-red-950/20 hover:text-red-300">
                <LogOut className="h-4 w-4 mr-2 inline" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      )
    }
  }

  // 4. Authorized
  return children
}
export default ProtectedRoute
