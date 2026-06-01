import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'
import { useAuth } from '../shared/hooks/useAuth'
import { Button } from '../shared/ui/button.jsx'
import { buildBaseHostUrl, buildTenantPath } from '../shared/config/runtime-config.js'

export default function Login() {
  const { login, isAuthenticated, isLoading, error, clearError, currentRole, user } = useAuth()
  const navigate = useNavigate()

  // Form states
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const resolvePostLoginTarget = (session) => {
    if (currentRole === 'Super Admin') {
      return '/super-admin/dashboard'
    }

    return session?.tenantId ? buildTenantPath(session.tenantId, '/dashboard') : '/dashboard'
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolvePostLoginTarget(user), { replace: true })
    }
  }, [currentRole, isAuthenticated, navigate, user])

  const loginHint = 'Use your account credentials to sign in.'

  // Clear previous errors when entering the page
  useEffect(() => {
    clearError()
  }, [clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier || !password) return

    try {
      const session = await login({
        identifier,
        password,
      })

      navigate(resolvePostLoginTarget(session), { replace: true })
    } catch {
      // Caught and set in Zustand error state
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 overflow-hidden px-4 py-12">
      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[130px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <a href={buildBaseHostUrl('/')} className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-lg shadow-lg shadow-indigo-500/25">
              D
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DSMS<span className="text-indigo-400 font-medium text-xs ml-1 uppercase tracking-wider">SaaS</span>
            </span>
          </a>
          <p className="mt-3 text-sm text-slate-400">{loginHint}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/20">
          <h2 className="text-xl font-bold tracking-tight text-white mb-6">Welcome Back</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300 shadow-md shadow-red-950/10">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400 mt-0.5" />
                <div className="leading-normal">
                  <span className="font-semibold text-red-200">Sign in failed: </span>
                  {error}
                </div>
              </div>
            )}

            {/* Identifier Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !identifier || !password}
              className="w-full flex items-center justify-center gap-2 mt-2 h-11"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-white" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In <Sparkles className="h-4 w-4 text-indigo-200" />
                </>
              )}
            </Button>
          </form>

          {/* Footer inside card */}
          <div className="mt-8 text-center pt-6 border-t border-slate-900/60">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <a href={buildBaseHostUrl('/register')} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Create Organization
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
