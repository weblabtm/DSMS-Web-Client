import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Sparkles, Eye, EyeOff, Lock, User, Server, AlertCircle } from 'lucide-react'
import { useAuth } from '../shared/hooks/useAuth'
import { Button } from '../shared/ui/button.jsx'

export default function Login() {
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Form states
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Redirect if already logged in
  const from = location.state?.from?.pathname || '/dashboard'
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  // Clear previous errors when entering the page
  useEffect(() => {
    clearError()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier || !password) return

    try {
      await login({
        identifier,
        password,
        tenantId: tenantId.trim() || undefined,
        branchId: branchId.trim() || undefined,
      })
      // Successful login triggers redirect via useEffect
    } catch (err) {
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
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-lg shadow-lg shadow-indigo-500/25">
              D
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DSMS<span className="text-indigo-400 font-medium text-xs ml-1 uppercase tracking-wider">SaaS</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-slate-400">Enter your credentials to access your terminal</p>
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

            {/* Advanced Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Server className="h-3.5 w-3.5" />
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced (Multi-tenant/Branch)'}
              </button>
            </div>

            {/* Advanced Fields (Tenant/Branch) */}
            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-slate-900/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Tenant ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="tenant-abc"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg border border-slate-800 bg-slate-950/50 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Branch ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="branch-xyz"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg border border-slate-800 bg-slate-950/50 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Standard SaaS endpoints isolate data context by Tenancy and Location. Leave empty if logging in to your default workspace.
                </p>
              </div>
            )}

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
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Create Organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
