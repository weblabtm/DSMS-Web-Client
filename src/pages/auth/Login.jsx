import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuth } from '../../shared/hooks/useAuth'
import { Button } from '../../shared/ui/button.jsx'
import { buildBaseHostUrl } from '../../shared/config/runtime-config.js'
import { useUiStore } from '../../shared/store/uiStore'

/** sessionStorage key for credentials staged during CAPTCHA redirect */
const PENDING_LOGIN_KEY = 'dsms_pending_login'

export default function Login() {
  const { login, completeLogin, isAuthenticated, isLoading, error, clearError, currentRole, user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const showLoader = useUiStore((state) => state.showLoader)
  const hideLoader = useUiStore((state) => state.hideLoader)

  // Form states
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0)

  // Guard: prevent the auto-submit effect from firing more than once per mount
  const hasAutoSubmitted = useRef(false)

  // ─── Lockout countdown ───────────────────────────────────────────────────────
  useEffect(() => {
    if (error && error.includes('Your account has been locked. Try again in')) {
      const match = error.match(/(\d+)\s+minutes\s+(\d+)\s+seconds/)
      if (match) {
        const mins = parseInt(match[1], 10)
        const secs = parseInt(match[2], 10)
        Promise.resolve().then(() => {
          setLockoutTimeLeft(mins * 60 + secs)
        })
      }
    } else {
      Promise.resolve().then(() => {
        setLockoutTimeLeft(0)
      })
    }
  }, [error])

  useEffect(() => {
    if (lockoutTimeLeft <= 0) return
    const timer = setInterval(() => {
      setLockoutTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          clearError()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [lockoutTimeLeft, clearError])

  // ─── Post-login target resolver ──────────────────────────────────────────────
  const resolveTarget = useCallback((session) => {
    const searchParams = new URLSearchParams(window.location.search)
    const nextUrl = searchParams.get('next')
    if (nextUrl && nextUrl.startsWith('/') && !nextUrl.startsWith('//')) return nextUrl

    const role = session?.roles?.[0] || currentRole
    if (role === 'Super Admin') return '/super-admin/dashboard'
    return '/resolve-user'
  }, [currentRole])

  // ─── Already authenticated redirect ─────────────────────────────────────────
  useEffect(() => {
    // Don't redirect if we're about to handle an OTP/CAPTCHA callback — the
    // auto-submit effect below will call completeLogin() first, which will
    // re-set isAuthenticated and then navigate to the dashboard.
    if (searchParams.has('otpDone') || searchParams.has('captchaDone')) return
    if (isAuthenticated) {
      navigate(resolveTarget(user), { replace: true })
    }
  }, [isAuthenticated, navigate, user, resolveTarget, searchParams])

  // ─── Clear stale errors on page load ────────────────────────────────────────
  useEffect(() => {
    clearError()
  }, [clearError])

  // ─── AUTO-SUBMIT: return from /challenge or /otp ─────────────────────────────
  //
  // Flow:
  //   captchaDone=true  → CAPTCHA cookie is now set → re-submit credentials
  //   otpDone=true      → OTP cookie is now set     → call completeLogin()
  //
  useEffect(() => {
    if (hasAutoSubmitted.current) return

    const hasCaptchaParam = searchParams.has('captchaDone')
    const hasOtpParam = searchParams.has('otpDone')

    if (!hasCaptchaParam && !hasOtpParam) return

    const captchaDone = searchParams.get('captchaDone') === 'true'
    const otpDone = searchParams.get('otpDone') === 'true'

    // Mark as handled and clean the URL immediately
    hasAutoSubmitted.current = true
    window.history.replaceState({}, '', window.location.pathname)

    if (!captchaDone && !otpDone) return

    const run = async () => {
      // ── OTP done: all verification cookies set — issue session ──
      if (otpDone) {
        showLoader('Completing sign in...')
        try {
          const session = await completeLogin()
          hideLoader()
          navigate(resolveTarget(session), { replace: true })
        } catch {
          hideLoader()
          // error state shown on form via store
        }
        return
      }

      // ── CAPTCHA done: re-submit credentials (captcha_verified_token cookie now present) ──
      if (captchaDone) {
        const stored = sessionStorage.getItem(PENDING_LOGIN_KEY)
        if (!stored) return // nothing to re-submit — show form normally

        let creds
        try {
          creds = JSON.parse(stored)
          sessionStorage.removeItem(PENDING_LOGIN_KEY)
        } catch {
          sessionStorage.removeItem(PENDING_LOGIN_KEY)
          return
        }

        // Restore form so the user can see what's being submitted
        setIdentifier(creds.identifier || '')
        setPassword(creds.password || '')
        setRememberMe(creds.rememberMe || false)

        showLoader('Authenticating credentials...')
        try {
          const session = await login(creds)
          hideLoader()
          navigate(resolveTarget(session), { replace: true })
        } catch (err) {
          hideLoader()
          const data = err?.data || {}
          const msg = data?.message || err?.message || ''

          if (msg === 'OTP required') {
            clearError()
            const phone = data.phoneNumber || ''
            const email = data.email || creds.identifier || ''
            navigate(
              `/otp?phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent('/login')}`,
              { replace: true }
            )
          }
          // other errors shown on form via store
        }
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // ─── Main form submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!identifier || !password) return

    showLoader('Authenticating credentials...')
    try {
      const session = await login({ identifier, password, rememberMe })
      hideLoader()
      navigate(resolveTarget(session), { replace: true })
    } catch (err) {
      hideLoader()
      const data = err?.data || {}
      const msg = data?.message || err?.message || ''

      if (msg === 'CAPTCHA required') {
        // Stage credentials and hand off to CAPTCHA page
        clearError()
        sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify({ identifier, password, rememberMe }))
        navigate(`/challenge?callbackUrl=${encodeURIComponent('/login')}`, { replace: true })
        return
      }

      if (msg === 'OTP required') {
        // CAPTCHA either not required or already satisfied — hand off to OTP page
        clearError()
        const phone = data.phoneNumber || ''
        const email = data.email || identifier || ''
        navigate(
          `/otp?phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent('/login')}`,
          { replace: true }
        )
        return
      }
      // Other errors (invalid credentials, lockout, etc.) show via store's error state
    }
  }

  return (
    <div className="h-screen bg-[#f8fafc] flex overflow-hidden relative">

      {/* Logo - Top Left Corner */}
      <div className="absolute top-6 left-6 z-20">
        <a href={buildBaseHostUrl('/')} className="inline-flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a472a] text-white font-extrabold text-lg shadow-lg shadow-[#1a472a]/20"
          >
            D
          </motion.div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            DriveSchool<span className="text-[#52b788] font-semibold">SaaS</span>
          </span>
        </a>
      </div>

      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[440px] bg-white border border-gray-200/80 rounded-3xl p-8 shadow-md hover:shadow-lg hover:border-gray-300/60 transition-all duration-300">
          
          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome back!</h1>
            <p className="text-gray-500 text-sm leading-relaxed">Please enter your details to sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                <div className="leading-normal">
                  <span className="font-semibold">Sign in failed: </span>
                  {lockoutTimeLeft > 0
                    ? `Your account has been locked. Try again in ${Math.floor(lockoutTimeLeft / 60)} minutes ${lockoutTimeLeft % 60} seconds.`
                    : error}
                </div>
              </div>
            )}

            {/* Email / Phone Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block">
                Email address / Phone
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-gray-600 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your email or phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-gray-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/resetPassword/request', { state: { email: identifier } })}
                  className="text-xs font-semibold text-[#1a472a] hover:text-[#2d6a4f] hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-gray-600 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer group-focus-within:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#1a472a] focus:ring-[#1a472a]"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-gray-600">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                disabled={isLoading || !identifier || !password}
                className="w-full flex items-center justify-center gap-2 h-12 bg-[#1a472a] hover:bg-[#2d6a4f] text-white font-semibold rounded-2xl shadow-lg shadow-[#1a472a]/20 transition-all duration-300"
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
            </div>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                className="flex items-center justify-center h-12 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center justify-center h-12 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center justify-center h-12 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm cursor-pointer"
              >
                <svg className="w-5 h-5" fill="#000000" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href={buildBaseHostUrl('/register')} className="font-semibold text-gray-900 hover:text-gray-700 transition-colors">
                SignUp
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        <img
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80"
          alt="Professional Driving"
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/50 to-[#1a472a]/20" />
        <div className="absolute -right-20 -bottom-20 w-[300px] h-[300px] bg-[#52b788]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-[200px] h-[200px] bg-[#52b788]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-between h-full p-16 pt-32 text-white">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-lg"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              Unified School Workspace
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Drive Your School Into the Future
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed font-normal">
              Streamline your driving school operations with our all-in-one platform. Access rosters, customize packages, and coordinate routes seamlessly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-auto pt-6 space-y-6"
          >
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div className="space-y-1">
                <div className="text-2xl lg:text-3xl font-extrabold text-white">500+</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Schools</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl lg:text-3xl font-extrabold text-white">10K+</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Students</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl lg:text-3xl font-extrabold text-white">98%</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Success Rate</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 select-none">
              © {new Date().getFullYear()} DriveSchool SaaS. Unified administrative control portal.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
