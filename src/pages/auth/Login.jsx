import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, AlertCircle, ChevronDown, Check } from 'lucide-react'
import { useAuth } from '../../shared/hooks/useAuth'
import { Button } from '../../shared/ui/button.jsx'
import { buildBaseHostUrl, buildTenantPath } from '../../shared/config/runtime-config.js'

export default function Login() {
  const { login, isAuthenticated, isLoading, error, clearError, currentRole, user } = useAuth()
  const navigate = useNavigate()

  // Form states
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'tenant_admin', label: 'Tenant Admin' },
    { value: 'learner_driver', label: 'Learner Driver' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'student', label: 'Student' }
  ]

  const resolvePostLoginTarget = useCallback((session) => {
    const searchParams = new URLSearchParams(window.location.search)
    const nextUrl = searchParams.get('next')

    if (nextUrl && nextUrl.startsWith('/') && !nextUrl.startsWith('//')) {
      return nextUrl
    }

    if (currentRole === 'Super Admin') {
      return '/super-admin/dashboard'
    }

    return session?.tenantId ? buildTenantPath(session.tenantId, '/dashboard') : '/dashboard'
  }, [currentRole])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(resolvePostLoginTarget(user), { replace: true })
    }
  }, [isAuthenticated, navigate, user, resolvePostLoginTarget])

  // Clear previous errors when entering the page
  useEffect(() => {
    clearError()
  }, [clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier || !password || !selectedRole) return

    try {
      const session = await login({
        identifier,
        password,
        role: selectedRole,
      })

      navigate(resolvePostLoginTarget(session), { replace: true })
    } catch {
      // Caught and set in Zustand error state
    }
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Logo - Top Left Corner */}
      <div className="absolute top-6 left-6 z-20">
        <a href={buildBaseHostUrl('/')} className="inline-flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white font-extrabold text-base shadow-md"
          >
            D
          </motion.div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            DriveSchool<span className="text-slate-600 font-semibold"> SaaS</span>
          </span>
        </a>
      </div>

      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Welcome back!</h1>
            <p className="text-slate-600 text-base leading-relaxed">Please enter your details to sign in to your account</p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                  <div className="leading-normal">
                    <span className="font-semibold">Sign in failed: </span>
                    {error}
                  </div>
                </motion.div>
              )}

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-slate-700 block">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-slate-700 block">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-12 pr-12 rounded-2xl border-2 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer group-focus-within:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <div className="text-right">
                  <a href="#forgot" className="text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </motion.div>

              {/* Role Selection */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-slate-700 block">
                  Select Role
                </label>
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="w-full h-12 px-4 rounded-2xl border-2 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-md hover:border-slate-300"
                  >
                    {selectedRole ? roles.find(r => r.value === selectedRole)?.label : 'Select your role'}
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isRoleDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 w-full mt-2 rounded-2xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden"
                    >
                      {roles.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.value)
                            setIsRoleDropdownOpen(false)
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between border-b border-slate-100 last:border-b-0"
                        >
                          {role.label}
                          {selectedRole === role.value && <Check className="h-5 w-5 text-slate-900" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Remember Me */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center"
              >
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="remember" className="ml-2 text-xs text-slate-600">
                  Remember me
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading || !identifier || !password || !selectedRole}
                  className="w-full flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">Or continue with</span>
                </div>
              </motion.div>

              {/* Social Login Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="grid grid-cols-3 gap-3"
              >
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700">Facebook</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-700">Apple</span>
                </button>
              </motion.div>
            </motion.form>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <a href={buildBaseHostUrl('/register')} className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">
                  SignUp
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>

      {/* Right Side - Professional Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80"
          alt="Professional Driving"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/70" />
        <div className="relative z-10 flex flex-col justify-center items-center p-16 text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-5xl font-extrabold mb-2 tracking-tight">Drive Your School</h2>
            <h2 className="text-5xl font-extrabold mb-4 tracking-tight">Into the Future</h2>
            <p className="text-xl text-white/90 mb-12">
              Streamline your driving school operations with our all-in-one platform
            </p>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-white/80 text-sm">Schools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">10K+</div>
                <div className="text-white/80 text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-white/80 text-sm">Success Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
