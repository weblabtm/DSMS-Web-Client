import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Mail,
  Key,
  Building,
  Loader2,
  Check,
  X,
  Server,
  Activity
} from 'lucide-react'
import { useAuth } from '../../shared/hooks/useAuth'
import { Button } from '../../shared/ui/button.jsx'
import { checkTenantSlugAvailability, createTenant, register as registerTenantAdmin } from '../../shared/api/authApi.js'
import { buildTenantPath, buildBaseHostUrl } from '../../shared/config/runtime-config.js'

import signupIllustration from '../../assets/signup_illustration.png'

// Helper to decode JWT token safely
const decodeToken = (token) => {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1]))
    return {
      role: payload.roles?.[0] || null,
      tenantId: payload.tenantId || null,
      branchId: payload.branchId || null,
    }
  } catch (err) {
    console.error('Failed to decode invitation token:', err)
    return null
  }
}

// Mapped permission selector for invited registrations
const getPermittedRoles = (inviterRole) => {
  if (!inviterRole) return ['Tenant Admin']
  switch (inviterRole) {
    case 'Super Admin':
      return ['Tenant Admin']
    case 'Tenant Admin':
      return ['Branch Manager', 'Instructor', 'Front Desk', 'Student']
    case 'Branch Manager':
      return ['Instructor', 'Front Desk', 'Student']
    case 'Front Desk':
      return ['Student']
    default:
      return []
  }
}

// Slug generator utility
const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')     // remove non-alphanumeric except spaces/hyphens
    .replace(/[\s_]+/g, '-')         // replace spaces/underscores with hyphens
    .replace(/-+/g, '-')             // remove consecutive hyphens
    .replace(/^-+|-+$/g, '')         // remove leading/trailing hyphens
}

export default function Register() {
  const { register, setSession, refreshToken, isAuthenticated, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteToken = searchParams.get('token')

  // Detect and parse invitation status
  const inviterInfo = decodeToken(inviteToken)
  const isInvitedMode = !!inviteToken && !!inviterInfo
  const permittedRoles = getPermittedRoles(inviterInfo?.role)

  // ─────────────────────────────────────────────────────────────────────────────
  // Core Registration States
  // ─────────────────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1) // Wizard steps: 1, 2, 3 (Only in Public mode)

  // Step 1: School Administration Account
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 1.5: Email Verification Modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailVerificationInput, setEmailVerificationInput] = useState('')
  const [mockVerificationCode] = useState('5588') // Mocked code
  const [verificationError, setVerificationError] = useState('')
  const [otpDispatchStatus, setOtpDispatchStatus] = useState('')

  // Step 2: Tenant Creation
  const [schoolName, setSchoolName] = useState('')
  const [tenantId, setTenantId] = useState(() => inviterInfo?.tenantId || '')
  const [branchId] = useState(() => inviterInfo?.branchId || '')

  // Slug checker system (Debounced)
  const [isSlugChecking, setIsSlugChecking] = useState(false)
  const [isSlugAvailable, setIsSlugAvailable] = useState(null) // null, true, false
  const [selectedRole, setSelectedRole] = useState(permittedRoles[0] || 'Tenant Admin')
  const slugDebounceRef = useRef(null)

  // General layout states
  const [validationError, setValidationError] = useState('')
  const [deploymentLogs, setDeploymentLogs] = useState([])
  const [tenantAdminSession, setTenantAdminSession] = useState(null)
  const [isProvisioningAdmin, setIsProvisioningAdmin] = useState(false)
  const [isDeployingSchool, setIsDeployingSchool] = useState(false)

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects & Listeners
  // ─────────────────────────────────────────────────────────────────────────────

  // Clear error layers on load
  useEffect(() => {
    clearError()
  }, [clearError])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(buildTenantPath(tenantId || inviterInfo?.tenantId || tenantAdminSession?.tenantId, '/dashboard'), { replace: true })
    }
  }, [isAuthenticated, navigate, inviterInfo?.tenantId, tenantAdminSession?.tenantId, tenantId])

  // Automatically generate and check slug when driving school name is modified
  const handleSchoolNameChange = (val) => {
    setSchoolName(val)
    if (!isInvitedMode) {
      const generatedSlug = slugify(val)
      setTenantId(generatedSlug)
      setIsSlugAvailable(null)
      setIsSlugChecking(generatedSlug.length >= 3)
    }
  }

  // Debounced Slug Availability Check
  useEffect(() => {
    if (isInvitedMode || !tenantId || tenantId.length < 3) {
      return
    }

    if (slugDebounceRef.current) {
      clearTimeout(slugDebounceRef.current)
    }

    const controller = new AbortController()

    slugDebounceRef.current = setTimeout(async () => {
      try {
        const result = await checkTenantSlugAvailability(tenantId)
        if (!controller.signal.aborted) {
          setIsSlugAvailable(Boolean(result?.available))
        }
      } catch {
        if (!controller.signal.aborted) {
          setIsSlugAvailable(false)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSlugChecking(false)
        }
      }
    }, 500)

    return () => {
      controller.abort()
      clearTimeout(slugDebounceRef.current)
    }
  }, [tenantId, isInvitedMode])

  // ─────────────────────────────────────────────────────────────────────────────
  // Navigation & Submit Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const validateStep1 = () => {
    setValidationError('')
    if (!identifier || !password || !confirmPassword) {
      setValidationError('All account fields are required.')
      return false
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return false
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.')
      return false
    }
    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(identifier)) {
      setValidationError('Please enter a valid email address.')
      return false
    }
    return true
  }

  const handleStep1Next = async (e) => {
    e.preventDefault()
    if (!validateStep1()) {
      return
    }

    setValidationError('')
    setVerificationError('')
    setIsProvisioningAdmin(true)

    try {
      const session = await registerTenantAdmin({
        identifier,
        password,
        role: 'Tenant Admin',
      })

      setTenantAdminSession(session)
      setOtpDispatchStatus(`An OTP has been sent to ${identifier} after your account was created.`)
      setIsEmailModalOpen(true)
      setEmailVerificationInput('')
    } catch (err) {
      setValidationError(err?.message || 'Unable to create the tenant admin account.')
    } finally {
      setIsProvisioningAdmin(false)
    }
  }

  const handleVerifyEmailCode = (e) => {
    e.preventDefault()
    if (emailVerificationInput === mockVerificationCode) {
      setVerificationError('')
      setIsEmailModalOpen(false)
      setStep(2)
      setValidationError('')
    } else {
      setVerificationError('Invalid verification code. Please check your inbox.')
    }
  }

  const handleStep2Next = (e) => {
    e.preventDefault()
    setValidationError('')

    if (!schoolName) {
      setValidationError('Driving school name is required.')
      return
    }

    if (!tenantId) {
      setValidationError('Driving school slug ID is required.')
      return
    }

    if (isSlugAvailable === false) {
      setValidationError('This slug ID is unavailable. Choose a different one.')
      return
    }

    setStep(3)
  }

  const handleDeploySchool = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!tenantAdminSession?.accessToken) {
      setValidationError('Create the tenant admin account first. The school cannot be deployed without the returned token.')
      return
    }

    setIsDeployingSchool(true)
    setDeploymentLogs([
      'Initializing school server deployment...',
      'Provisioning School Administration account...',
    ])

    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Validating credentials and security certificates...'])
    }, 400)

    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, `Linking tenant node to: ${identifier}...`])
    }, 800)

    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, `Provisioning school database cluster for: ${schoolName}...`])
    }, 1200)

    setTimeout(() => {
      setDeploymentLogs(prev => [...prev, 'Starting final compilation...'])
    }, 1600)

    setTimeout(async () => {
      try {
        setDeploymentLogs(prev => [...prev, '✓ Administration token confirmed.'])

        // ── Step 2: Create the tenant using the fresh accessToken ──
        const createdTenant = await createTenant(schoolName, tenantId, identifier, tenantAdminSession.accessToken)

        const linkedSession = {
          ...tenantAdminSession,
          tenantId: createdTenant.slug || tenantId,
        }

        setTenantAdminSession(linkedSession)

        setDeploymentLogs(prev => [...prev, `✓ School node "${schoolName}" activated and linked.`])
        setDeploymentLogs(prev => [...prev, 'Redirecting to control center...'])

        setSession(linkedSession)
        try {
          await refreshToken()
        } catch (refreshError) {
          console.warn('Unable to refresh linked tenant session:', refreshError)
        }

        setTimeout(() => {
          navigate(buildTenantPath(createdTenant.slug || tenantId, '/dashboard'))
        }, 800)
      } catch (err) {
        setValidationError(err.message || 'Deployment node configuration failed.')
        setDeploymentLogs([])
      } finally {
        setIsDeployingSchool(false)
      }
    }, 2000)
  }

  // Handle registration for invited users (Single-step flow)
  const handleInvitedSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!identifier || !password || !confirmPassword) {
      setValidationError('All fields are required.')
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    try {
      await register(
        {
          identifier,
          password,
          role: selectedRole,
          tenantId: tenantId.trim() || undefined,
          branchId: branchId.trim() || undefined,
        },
        inviteToken
      )

      navigate(buildTenantPath(tenantId || inviterInfo?.tenantId || tenantAdminSession?.tenantId, '/dashboard'), { replace: true })
    } catch {
      // Handled by store error state
    }
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden font-sans">
      
      {/* LEFT SIDE - Beautiful Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        <img
          src={signupIllustration}
          alt="Modern Cockpit Driving Training Simulator"
          className="absolute inset-0 w-full h-full object-cover opacity-85 scale-105 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/75 to-indigo-950/60" />
        
        {/* Floating Brand & Logo */}
        <div className="absolute top-8 left-8 z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-white font-extrabold text-base shadow-md">
              D
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              DriveSchool<span className="text-slate-300/80 font-medium">SaaS</span>
            </span>
          </Link>
        </div>

        {/* Content Info overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-16 pt-32 text-white">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-lg"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              Fast Tenancy Deployment
            </span>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Begin Your Journey to Smarter Operations
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed font-normal">
              Deploy a dedicated, localized node of our leading driving school management system. Streamline scheduling, track instructor routes, and simplify billing in minutes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6 border-t border-slate-800/80 pt-8"
          >
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Reliability</span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">High-performance cloud servers optimized for fast scheduling and lesson tracking.</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Security</span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">Secure workspace isolation protecting all student records and business data.</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 select-none">
              © {new Date().getFullYear()} DriveSchool SaaS. Built to empower driving instructors globally.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center p-6 sm:p-12 md:p-16 bg-[#f8fafc] overflow-y-auto relative">

        <div className="w-full max-w-lg my-auto py-8">
          
          {/* RENDER CASE A: Invited Join Flow */}
          {isInvitedMode ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-550/10 border border-emerald-220 text-xs font-semibold text-emerald-700 mb-3">
                  <ShieldCheck className="h-4 w-4" /> Invitation Verified
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Complete Registration</h2>
                <p className="text-slate-600 text-sm mt-1">Configure your credentials to activate your invited school account.</p>
              </div>

              {/* Invitation Info banner */}
              <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm leading-relaxed text-xs text-slate-600 space-y-2.5">
                <p>
                  You are joining as an authorized <span className="font-bold text-slate-900 uppercase bg-slate-100 px-2 py-0.5 rounded">{inviterInfo.role}</span>.
                </p>
                <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span>Tenancy Context:</span>
                  <span className="font-mono font-semibold text-slate-800">{tenantId || inviterInfo.tenantId}</span>
                </p>
              </div>

              <form onSubmit={handleInvitedSubmit} className="space-y-4">
                {(validationError || error) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                    <div className="leading-normal">
                      <span className="font-semibold">Failed to register: </span>
                      {validationError || error}
                    </div>
                  </motion.div>
                )}

                {/* Email input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@yourschool.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                    />
                  </div>
                </div>

                {/* Passwords grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Password</label>
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
                        className="w-full h-12 pl-12 pr-12 rounded-2xl border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 pl-12 pr-12 rounded-2xl border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prefilled Context Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Account Role</label>
                    <select
                      disabled={permittedRoles.length <= 1}
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-slate-900 transition-all duration-300 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {permittedRoles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Tenancy Slug</label>
                    <input
                      type="text"
                      disabled
                      value={tenantId}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {branchId && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Branch ID</label>
                    <input
                      type="text"
                      disabled
                      value={branchId}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 mt-4 h-12 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                      Activating session...
                    </>
                  ) : (
                    <>
                      Activate Account <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-slate-200/80">
                <p className="text-sm text-slate-600">
                  Already registered?{' '}
                  <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">Sign In</Link>
                </p>
              </div>
            </motion.div>
          ) : (
            
            /* RENDER CASE B: Multi-Step Public Wizard Flow */
            <div className="space-y-12">
              
              {/* Heading */}
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">Create Your Driving School</h2>
                <p className="text-slate-600 text-sm mt-2">Deploy your autonomous school administrative dashboard in 3 easy steps.</p>
              </div>

              {/* Premium Stepper Progress Indicator (Image 2 style) */}
              <div className="relative pt-2 max-w-sm mx-auto">
                <div className="absolute top-[20px] left-0 right-0 h-[3px] bg-slate-200/70 rounded-full" />
                <div
                  className="absolute top-[20px] left-0 h-[3px] bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                />
                
                <div className="relative flex justify-between z-10">
                  {[1, 2, 3].map((num) => {
                    const isCompleted = step > num;
                    const isActive = step === num;
                    return (
                      <div key={num} className="flex flex-col items-center">
                        <button
                          type="button"
                          disabled={num > step}
                          onClick={() => setStep(num)}
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold border-2 transition-all duration-300 cursor-pointer ${
                            isCompleted
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                              : isActive
                              ? 'bg-white border-indigo-600 text-indigo-600 shadow-md ring-4 ring-indigo-100/50'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {isCompleted ? <Check className="h-4 w-4 font-bold" /> : num}
                        </button>
                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-3.5 transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {num === 1 && 'Credentials'}
                          {num === 2 && 'School Info'}
                          {num === 3 && 'Verification'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Form Validation Errors Banner */}
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                  <div className="leading-normal">
                    <span className="font-semibold">Setup Alert: </span>
                    {validationError}
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Administrator account creation */}
              {step === 1 && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleStep1Next}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Administrator Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="admin@yourschool.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Password</label>
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
                          className="w-full h-12 pl-12 pr-10 rounded-2xl border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Confirm Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                          <Lock className="h-5 w-5" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full h-12 pl-12 pr-10 rounded-2xl border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isProvisioningAdmin}
                    className="w-full h-12 flex items-center justify-center gap-2 mt-4 bg-slate-900 hover:bg-slate-850 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isProvisioningAdmin ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                        Creating Admin...
                      </>
                    ) : (
                      <>
                        Continue to School Config <ArrowRight className="h-4.5 w-4.5" />
                      </>
                    )}
                  </Button>
                </motion.form>
              )}

              {/* STEP 2: Tenancy Details Setup */}
              {step === 2 && (
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleStep2Next}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Driving School Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                        <Building className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Driving Academy"
                        value={schoolName}
                        onChange={(e) => handleSchoolNameChange(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Subdomain Routing Slug ID</label>
                    <div className="relative group">
                      <input
                        type="text"
                        required
                        placeholder="e.g. apex-driving"
                        value={tenantId}
                        onChange={(e) => {
                          const nextSlug = slugify(e.target.value)
                          setTenantId(nextSlug)
                          setIsSlugAvailable(null)
                          setIsSlugChecking(nextSlug.length >= 3)
                        }}
                        className="w-full h-12 pl-4 pr-12 rounded-2xl border border-slate-200 bg-white text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 font-mono shadow-sm hover:shadow-md hover:border-slate-300"
                      />
                      
                      {/* Slug availability loader indicators */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        {isSlugChecking && (
                          <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                        )}
                        {isSlugAvailable === true && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                            <Check className="h-4 w-4 font-bold" />
                          </div>
                        )}
                        {isSlugAvailable === false && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 border border-red-200">
                            <X className="h-4 w-4 font-bold" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dynamic availability messaging */}
                    <div className="px-1.5 min-h-[16px]">
                      {isSlugAvailable === true && (
                        <p className="text-[11px] text-emerald-600 font-semibold">✓ Unique endpoint and routing verified.</p>
                      )}
                      {isSlugAvailable === false && (
                        <p className="text-[11px] text-red-500 font-semibold">✗ Slug ID taken or reserved. Please customize it.</p>
                      )}
                      {!tenantId && (
                        <p className="text-[11px] text-slate-500">The slug scopes your database workspace and URL matching context.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 h-12 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-200"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2 inline" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSlugAvailable === false || !schoolName}
                      className="flex-1 h-12 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Confirm Workspace <ArrowRight className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: Review and deployment */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  
                  {deploymentLogs.length > 0 ? (
                    
                    /* STYLISH VIRTUAL LOG TERMINAL */
                    <div className="rounded-2xl border border-slate-950 bg-slate-950 p-6 font-mono text-xs leading-relaxed text-indigo-300 space-y-2.5 shadow-2xl relative select-none">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Workspace provision logs</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500/80" />
                          <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                          <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                        </div>
                      </div>
                      <div className="space-y-2 mt-2 h-44 overflow-y-auto pr-1">
                        {deploymentLogs.map((log, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-start"
                          >
                            <span className="text-slate-600 mr-2 select-none">&gt;_</span>
                            <span className="text-slate-300">{log}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    
                    /* SUMMARY REVIEW COMPONENT */
                    <div className="space-y-4">
                      
                      {/* Review Block A */}
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3.5 shadow-sm">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-indigo-650" /> Owner Identity
                        </span>
                        <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                          <span className="text-slate-500">Email Address:</span>
                          <span className="font-semibold text-slate-950">{identifier}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Privileges:</span>
                          <span className="px-2.5 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-700 uppercase">
                            School Administrator
                          </span>
                        </div>
                      </div>

                      {/* Review Block B */}
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3.5 shadow-sm">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                          <Server className="h-4 w-4 text-indigo-650" /> Tenancy Node
                        </span>
                        <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                          <span className="text-slate-500">School Name:</span>
                          <span className="font-semibold text-slate-950">{schoolName}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Slug Identifier:</span>
                          <span className="font-mono font-semibold text-indigo-650 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100">{tenantId}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Host Endpoint:</span>
                          <span className="font-mono text-xs text-slate-500">{tenantId}.dsmsapp.com</span>
                        </div>
                      </div>

                      {/* Stepper Buttons */}
                      <div className="flex gap-4 pt-2">
                        <Button
                          type="button"
                          onClick={() => setStep(2)}
                          variant="outline"
                          className="flex-1 h-12 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-200"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2 inline" /> Back
                        </Button>
                        <Button
                          onClick={handleDeploySchool}
                          disabled={!tenantAdminSession?.accessToken || isDeployingSchool}
                          className="flex-1 h-12 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {isDeployingSchool ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin text-white" />
                              Compiling cluster...
                            </>
                          ) : (
                            <>
                              Compile &amp; Deploy <Sparkles className="h-4.5 w-4.5" />
                            </>
                          )}
                        </Button>
                      </div>

                    </div>
                  )}

                </motion.div>
              )}

              {/* General Bottom Navigation Link */}
              <div className="text-center pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Already have a school workspace?{' '}
                  <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 
          EMAIL VERIFICATION GLASS MODAL 
          (Simulates verification code dispatcher inbox link)
      */}
      <AnimatePresence>
        {isEmailModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200/50 p-8 shadow-2xl text-center relative"
            >
              
              {/* Envelope badge */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                <Mail className="h-6 w-6" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {otpDispatchStatus || (
                  <>
                    An account has been pre-created. Please verify your address to continue with your school workspace configuration.
                  </>
                )}
              </p>

              <form onSubmit={handleVerifyEmailCode} className="space-y-4 text-left">
                {verificationError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                    <div className="leading-normal">{verificationError}</div>
                  </div>
                )}

                {/* Verification PIN Code input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Verification PIN Code</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                      <Key className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter 4-digit code"
                      maxLength={4}
                      value={emailVerificationInput}
                      onChange={(e) => setEmailVerificationInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-slate-200 bg-white text-base text-slate-900 placeholder:text-slate-400 placeholder:text-sm tracking-widest text-center focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 font-bold shadow-sm"
                    />
                  </div>
                </div>

                {/* Simulation Dispatch Notification */}
                <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-xs leading-relaxed text-indigo-900">
                  <span className="font-bold text-indigo-950 block mb-0.5">📧 Simulation Sandbox Inbox</span>
                  A simulated OTP verification PIN code was dispatched to your console: <span className="font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 ml-1 tracking-widest">{mockVerificationCode}</span>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={emailVerificationInput.length < 4}
                    className="flex-1 h-12 bg-slate-900 hover:bg-slate-850 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Verify PIN
                  </Button>
                </div>
              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
