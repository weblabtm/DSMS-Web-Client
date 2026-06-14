import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
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
  Building,
  Loader2,
  Check,
  X,
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
  const [step, setStep] = useState(1) // Wizard steps: 1, 2, 3, 4 (Only in Public mode)

  // Step 1: School Administration Account
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 2: Personal
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')  // Step 1.5: Email Verification
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [mockVerificationCode] = useState('558822') // Mocked code
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

  const handleStep1Next = (e) => {
    e.preventDefault()
    if (validateStep1()) {
      setValidationError('')
      setStep(2) // Move to step 2 (Personal)
    }
  }

  const validateStep2 = () => {
    setValidationError('')
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      setValidationError('First name, last name, and phone number are required.')
      return false
    }
    const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/
    if (!phoneRegex.test(phoneNumber.trim())) {
      setValidationError('Please enter a valid phone number.')
      return false
    }
    return true
  }

  const handleStep2Next = async (e) => {
    e.preventDefault()
    if (!validateStep2()) {
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

      localStorage.setItem('dsms_admin_firstName', firstName.trim())
      localStorage.setItem('dsms_admin_lastName', lastName.trim())
      localStorage.setItem('dsms_admin_phoneNumber', phoneNumber.trim())

      setTenantAdminSession(session)
      setOtpDispatchStatus(`An OTP has been sent to ${identifier} after your account was created.`)
      setPin(['', '', '', '', '', ''])
      setStep(3) // Transition directly to Step 3 (Verification OTP)
    } catch (err) {
      setValidationError(err?.message || 'Unable to create the tenant admin account.')
    } finally {
      setIsProvisioningAdmin(false)
    }
  }

  const handlePinChange = (value, index) => {
    const cleanVal = value.replace(/\D/g, '')
    if (!cleanVal) {
      const newPin = [...pin]
      newPin[index] = ''
      setPin(newPin)
      return
    }

    const digits = cleanVal.split('')
    const newPin = [...pin]
    let pinIdx = index
    for (let i = 0; i < digits.length && pinIdx < 6; i++) {
      newPin[pinIdx] = digits[i]
      pinIdx++
    }
    setPin(newPin)

    // Focus next input
    if (pinIdx < 6) {
      const nextInput = document.getElementById(`pin-${pinIdx}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const newPin = [...pin]
        newPin[index - 1] = ''
        setPin(newPin)
        const prevInput = document.getElementById(`pin-${index - 1}`)
        if (prevInput) {
          prevInput.focus()
        }
      } else {
        const newPin = [...pin]
        newPin[index] = ''
        setPin(newPin)
      }
    }
  }

  const handleVerifyEmailCode = (e) => {
    e.preventDefault()
    const enteredPin = pin.join('')
    if (enteredPin === mockVerificationCode) {
      setVerificationError('')
      setStep(4) // Transition directly to Step 4 (School Config)
      setValidationError('')
    } else {
      setVerificationError('Invalid verification code. Please check your inbox.')
    }
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
    <div className="h-screen bg-[#f8fafc] flex overflow-hidden font-sans relative">
      
      {/* Logo - Top Left Corner */}
      <div className="absolute top-6 left-6 z-20">
        <a href={buildBaseHostUrl('/')} className="inline-flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a472a] text-white font-extrabold text-lg shadow-lg shadow-[#1a472a]/20"
          >
            D
          </motion.div>
          <span className="text-lg font-bold tracking-tight text-gray-900 lg:text-white">
            DriveSchool<span className="text-[#52b788] font-semibold">SaaS</span>
          </span>
        </a>
      </div>

      {/* LEFT SIDE - Beautiful Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-950">
        <img
          src={signupIllustration}
          alt="Modern Cockpit Driving Training Simulator"
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/50 to-[#1a472a]/20" />
        <div className="absolute -right-20 -bottom-20 w-[300px] h-[300px] bg-[#52b788]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-[200px] h-[200px] bg-[#52b788]/10 rounded-full blur-[80px] pointer-events-none" />

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-auto pt-6"
          >
            <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Reliability</span>
                  </div>
                  <p className="text-xs text-slate-450 leading-normal">High-performance cloud servers optimized for fast scheduling and lesson tracking.</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Security</span>
                  </div>
                  <p className="text-xs text-slate-450 leading-normal">Secure workspace isolation protecting all student records and business data.</p>
                </div>
              </div>
              <div className="text-center pt-2 border-t border-white/5">
                <p className="text-[10px] text-slate-400 select-none">
                  © {new Date().getFullYear()} DriveSchool SaaS. Built to empower driving instructors globally.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center p-4 sm:p-8 md:p-12 bg-[#f8fafc] overflow-y-auto relative">
        
        <div className="w-full max-w-xl my-auto bg-white border border-gray-250/70 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-lg hover:border-gray-300/60 transition-all duration-300">
          
          {/* RENDER CASE A: Invited Join Flow */}
          {isInvitedMode ? (
            <div className="space-y-5">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-550/10 border border-emerald-220 text-xs font-semibold text-emerald-700 mb-2">
                  <ShieldCheck className="h-4 w-4" /> Invitation Verified
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Complete Registration</h2>
                <p className="text-slate-600 text-sm mt-1">Configure your credentials to activate your invited school account.</p>
              </div>

              {/* Invitation Info banner */}
              <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm leading-relaxed text-xs text-slate-600 space-y-2">
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
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                    <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                    <div className="leading-normal">
                      <span className="font-semibold">Failed to register: </span>
                      {validationError || error}
                    </div>
                  </div>
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
                      className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
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
                        className="w-full h-12 pl-12 pr-12 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
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
                        className="w-full h-12 pl-12 pr-12 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
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
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:border-[#52b788] transition-all duration-300 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
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
                  className="w-full flex items-center justify-center gap-2 mt-4 h-12 bg-[#1a472a] hover:bg-[#2d6a4f] text-white font-semibold rounded-2xl shadow-lg shadow-[#1a472a]/20 transition-all duration-300"
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
                <p className="text-sm text-slate-655">
                  Already registered?{' '}
                  <Link to="/login" className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">Sign In</Link>
                </p>
              </div>
            </div>
          ) : (
            
            /* RENDER CASE B: Multi-Step Public Wizard Flow */
            <div className="space-y-6">
              
              {/* Heading */}
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">Create Your Driving School</h2>
                <p className="text-slate-600 font-medium text-sm mt-1">Deploy your autonomous school administrative dashboard in 4 easy steps.</p>
              </div>

              {/* Premium Stepper Progress Indicator */}
              <div className="relative pt-1 max-w-sm mx-auto">
                <div className="absolute top-[20px] left-0 right-0 h-[3px] bg-slate-200/70 rounded-full" />
                <div
                  className="absolute top-[20px] left-0 h-[3px] bg-[#1a472a] rounded-full transition-all duration-300"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                />
                
                <div className="relative flex justify-between z-10">
                  {[1, 2, 3, 4].map((num) => {
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
                              ? 'bg-[#1a472a] border-[#1a472a] text-white shadow-sm'
                              : isActive
                              ? 'bg-white border-[#1a472a] text-[#1a472a] shadow-md ring-4 ring-[#1a472a]/10'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {isCompleted ? <Check className="h-4 w-4 font-bold" /> : num}
                        </button>
                        <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors duration-300 ${isActive ? 'text-[#1a472a]' : 'text-slate-400'}`}>
                          {num === 1 && 'Credentials'}
                          {num === 2 && 'Personal'}
                          {num === 3 && 'Verification'}
                          {num === 4 && 'School Config'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Form Validation Errors Banner */}
              {validationError && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-650 mt-0.5" />
                  <div className="leading-normal">
                    <span className="font-semibold">Setup Alert: </span>
                    {validationError}
                  </div>
                </div>
              )}

              {/* STEP 1: Administrator account creation */}
              {step === 1 && (
                <form
                  onSubmit={handleStep1Next}
                  className="space-y-4"
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
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
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
                          className="w-full h-12 pl-12 pr-10 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
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
                          className="w-full h-12 pl-12 pr-10 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
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
                    className="w-full h-12 flex items-center justify-center gap-2 mt-4 bg-[#1a472a] hover:bg-[#2d6a4f] text-white font-semibold rounded-2xl shadow-lg shadow-[#1a472a]/20 transition-all duration-300 cursor-pointer"
                  >
                    Continue <ArrowRight className="h-4.5 w-4.5" />
                  </Button>
                </form>
              )}

              {/* STEP 2: Personal */}
              {step === 2 && (
                <form
                  onSubmit={handleStep2Next}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">First Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Last Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 555-0100"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                    />
                  </div>

                  <div className="flex gap-4 pt-1">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 text-slate-700 font-semibold transition-all duration-200 flex items-center justify-center cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2 inline" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProvisioningAdmin}
                      className="flex-1 h-12 flex items-center justify-center gap-2 bg-[#1a472a] hover:bg-[#2d6a4f] text-white font-semibold rounded-2xl shadow-lg shadow-[#1a472a]/20 transition-all duration-300"
                    >
                      {isProvisioningAdmin ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                          Creating Admin...
                        </>
                      ) : (
                        <>
                          Continue to Verification <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 3: Email Verification */}
              {step === 3 && (
                <form
                  onSubmit={handleVerifyEmailCode}
                  className="space-y-4"
                >
                  <div className="text-center space-y-1">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d8f3dc] text-[#1a472a] border border-[#52b788]/30 shadow-sm mb-1">
                      <Mail className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Verify Your Email</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {otpDispatchStatus || `An OTP has been sent to ${identifier} after your account was created.`}
                    </p>
                  </div>

                  {verificationError && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-755">
                      <AlertCircle className="h-5 w-5 shrink-0 text-red-650 mt-0.5" />
                      <div className="leading-normal">{verificationError}</div>
                    </div>
                  )}

                  {/* Verification PIN Code input */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block text-center">Verification PIN Code</label>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`pin-${index}`}
                          type="text"
                          maxLength={1}
                          pattern="\d*"
                          inputMode="numeric"
                          value={pin[index]}
                          onChange={(e) => handlePinChange(e.target.value, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-12 h-12 text-center text-lg font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Simulation Dispatch Notification */}
                  <div className="rounded-2xl bg-[#d8f3dc] border border-[#52b788]/30 p-3 text-xs leading-relaxed text-[#1a472a]">
                    <span className="font-bold text-[#1a472a] block mb-0.5">📧 Simulation Sandbox Inbox</span>
                    A simulated OTP verification PIN code was dispatched to your console: <span className="font-mono font-bold text-[#1a472a] bg-white px-2 py-0.5 rounded border border-[#52b788]/30 ml-1 tracking-widest">{mockVerificationCode}</span>
                  </div>

                  <div className="flex gap-4 pt-1">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 text-slate-700 font-semibold transition-all duration-200 flex items-center justify-center cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2 inline" /> Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={pin.some(digit => digit === '')}
                      className="flex-1 h-12 bg-[#1a472a] hover:bg-[#2d6a4f] text-white font-semibold rounded-2xl shadow-lg shadow-[#1a472a]/20 transition-all duration-300"
                    >
                      Verify PIN &amp; Continue
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 4: School Workspace Config & Review */}
              {step === 4 && (
                <div className="space-y-4">
                  {deploymentLogs.length > 0 ? (
                    /* STYLISH VIRTUAL LOG TERMINAL */
                    <div className="rounded-2xl border border-slate-950 bg-slate-950 p-5 font-mono text-xs leading-relaxed text-emerald-300 space-y-2.5 shadow-2xl relative select-none">
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
                          <div
                            key={idx}
                            className="flex items-start"
                          >
                            <span className="text-slate-600 mr-2 select-none">&gt;_</span>
                            <span className="text-slate-300">{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* CONFIGURATION & SUMMARY FORM */
                    <form onSubmit={handleDeploySchool} className="space-y-4">
                      
                      {/* Section 1: School Info Inputs */}
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Driving School Name</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-slate-650 transition-colors">
                              <Building className="h-5 w-5" />
                            </div>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Apex Driving Academy"
                              value={schoolName}
                              onChange={(e) => handleSchoolNameChange(e.target.value)}
                              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Username</label>
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
                              className="w-full h-12 pl-4 pr-12 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#52b788] focus:ring-4 focus:ring-[#52b788]/20 transition-all duration-300 font-mono shadow-sm hover:shadow-md hover:border-slate-300"
                            />
                            
                            {/* Slug availability loader indicators */}
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                              {isSlugChecking && (
                                <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                              )}
                              {isSlugAvailable === true && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                                  <Check className="h-4 w-4 font-bold" />
                                </div>
                              )}
                              {isSlugAvailable === false && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-650 border border-red-200">
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
                              <p className="text-[11px] text-red-500 font-semibold">✗ Username taken or reserved. Please customize it.</p>
                            )}
                            {!tenantId && (
                              <p className="text-[11px] text-slate-500">The username scopes your database workspace and URL matching context.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Owner Review Badge */}
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2.5 shadow-sm">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-[#1a472a]" /> Owner Identity
                        </span>
                        <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-2.5">
                          <span className="text-slate-500">Owner Name:</span>
                          <span className="font-semibold text-slate-900">{firstName} {lastName}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Email Address:</span>
                          <span className="font-semibold text-slate-900">{identifier}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Privileges:</span>
                          <span className="px-2.5 py-0.5 rounded-full border border-[#52b788]/30 bg-[#d8f3dc]/50 text-[10px] font-bold text-[#1a472a] uppercase">
                            School Administrator
                          </span>
                        </div>
                      </div>

                      {/* Stepper Buttons */}
                      <div className="flex gap-4 pt-1">
                        <Button
                          type="button"
                          onClick={() => setStep(3)}
                          variant=""
                          className="flex-1 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 text-slate-700 font-semibold transition-all duration-200 flex items-center justify-center cursor-pointer"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2 inline" /> Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={!tenantAdminSession?.accessToken || isDeployingSchool || isSlugAvailable === false || !schoolName}
                          className="flex-1 h-12 flex items-center justify-center gap-2 bg-[#1a472a] hover:bg-[#2d6a4f] text-white font-semibold rounded-2xl shadow-lg shadow-[#1a472a]/20 transition-all duration-300"
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

                    </form>
                  )}
                </div>
              )}

              {/* General Bottom Navigation Link */}
              <div className="text-center pt-4 border-t border-slate-200">
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

    </div>
  )
}
