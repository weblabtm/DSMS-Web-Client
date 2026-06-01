import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
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
  X
} from 'lucide-react'
import { useAuth } from '../shared/hooks/useAuth'
import { Button } from '../shared/ui/button.jsx'
import { checkTenantSlugAvailability, createTenant, register as registerTenantAdmin } from '../shared/api/authApi.js'
import { buildTenantPath } from '../shared/config/runtime-config.js'

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

  // Step 2: Tenet Creation ("Create your Learners")
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
      'Initialising school server deployment...',
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

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Invited Joining Flow (Single-Step)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isInvitedMode) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 overflow-hidden px-4 py-12">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[130px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[130px]" />
        </div>

        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-lg shadow-lg shadow-indigo-500/25">D</div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                DSMS<span className="text-indigo-400 font-medium text-xs ml-1 uppercase tracking-wider">SaaS</span>
              </span>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold tracking-tight text-white mb-2">Join Organization</h2>
            <p className="text-xs text-slate-400 mb-6">Setup your credentials to activate your invited account</p>

            {/* Invited banner */}
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-4 text-xs text-emerald-300 shadow-md">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="leading-relaxed">
                <span className="font-bold text-emerald-200 block mb-0.5">Invitation Verified</span>
                You are invited by a <span className="font-bold text-white uppercase">{inviterInfo.role}</span>.
                Your school tenancy context is pre-configured and locked.
              </div>
            </div>

            <form onSubmit={handleInvitedSubmit} className="space-y-4">
              {(validationError || error) && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300 shadow-md">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400 mt-0.5" />
                  <div className="leading-normal">
                    <span className="font-semibold text-red-200">Registration failed: </span>
                    {validationError || error}
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@school.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
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
                      className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Prefilled tags */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-900/60 mt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Account Role</label>
                  <select
                    disabled={permittedRoles.length <= 1}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-800 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {permittedRoles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">School Tenancy Node</label>
                  <input
                    type="text"
                    disabled
                    value={tenantId}
                    className="w-full h-11 px-4 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {branchId && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Location Branch ID</label>
                  <input
                    type="text"
                    disabled
                    value={branchId}
                    className="w-full h-11 px-4 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 mt-4 h-11"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-white" />
                    Deploying Node...
                  </>
                ) : (
                  <>
                    Activate Invite <Sparkles className="h-4 w-4 text-indigo-200" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-slate-900/60">
              <p className="text-xs text-slate-400">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: Multi-Step Public Wizard Flow
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 overflow-hidden px-4 py-12">
      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[130px]" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-lg shadow-lg shadow-indigo-500/25">D</div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DSMS<span className="text-indigo-400 font-medium text-xs ml-1 uppercase tracking-wider">SaaS</span>
            </span>
          </Link>
        </div>

        {/* Wizard Main Card */}
        <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/20 relative">

          {/* Stepper Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
              <span className={step >= 1 ? 'text-indigo-400 font-extrabold' : ''}>1. Admin Account</span>
              <span className={step >= 2 ? 'text-indigo-400 font-extrabold' : ''}>2. School Node</span>
              <span className={step >= 3 ? 'text-indigo-400 font-extrabold' : ''}>3. Deploy</span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="mt-2.5 h-1 w-full bg-slate-950 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300 shadow-md shadow-indigo-500/50"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Validation banner */}
          {validationError && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300 shadow-md animate-in fade-in duration-200">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-400 mt-0.5" />
              <div className="leading-normal">
                <span className="font-semibold text-red-200">Alert: </span>
                {validationError}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              STEP 1: School Administration Account Form
          ═══════════════════════════════════════════════ */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">School Administration Account</h3>
                <p className="text-xs text-slate-400">Deploy a central administrator node to supervise school workflows</p>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Administrator Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="admin@yourschool.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Password</label>
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
                      className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <Button
                type="submit"
                disabled={isProvisioningAdmin}
                className="w-full h-11 flex items-center justify-center gap-2 mt-2"
              >
                {isProvisioningAdmin ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Continue Setup <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* ═══════════════════════════════════════════════
              STEP 2: Tenet Creation ("Create your Learners")
          ═══════════════════════════════════════════════ */}
          {step === 2 && (
            <form onSubmit={handleStep2Next} className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Create your Learners</h3>
                <p className="text-xs text-slate-400">Configure your localized SaaS node properties</p>
              </div>

              {/* Driving School Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Driving School Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Building className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Academy"
                    value={schoolName}
                    onChange={(e) => handleSchoolNameChange(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Slug ID (With automatic availability listener) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">School URL Slug ID</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="zenith-academy"
                    value={tenantId}
                    onChange={(e) => {
                      const nextSlug = slugify(e.target.value)
                      setTenantId(nextSlug)
                      setIsSlugAvailable(null)
                      setIsSlugChecking(nextSlug.length >= 3)
                    }}
                    className="w-full h-11 pl-4 pr-12 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-all duration-200 font-mono"
                  />

                  {/* Status Indicator */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {isSlugChecking && (
                      <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                    )}
                    {isSlugAvailable === true && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Check className="h-3.5 w-3.5 font-bold" />
                      </div>
                    )}
                    {isSlugAvailable === false && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        <X className="h-3.5 w-3.5 font-bold" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Helper Messaging */}
                {isSlugAvailable === true && (
                  <p className="text-[10px] text-emerald-400 leading-none">✓ Normal routing is active for this setup.</p>
                )}
                {isSlugAvailable === false && (
                  <p className="text-[10px] text-red-400 leading-none">
                    ✗ Slug taken or unavailable (reserved / too short). Choose another identifier.
                  </p>
                )}
                {!tenantId && (
                  <p className="text-[10px] text-slate-500 leading-none">Slug ID is used as the school identifier for normal routing mode.</p>
                )}
              </div>

              {/* Stepper Actions */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-11 border-slate-800 hover:bg-slate-900 text-slate-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 inline" /> Back
                </Button>

                <Button
                  type="submit"
                  disabled={isSlugAvailable === false || !schoolName}
                  className="flex-1 h-11 flex items-center justify-center gap-2"
                >
                  Confirm Node <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* ═══════════════════════════════════════════════
              STEP 3: Review and deploy your driving school
          ═══════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Review &amp; Deploy School</h3>
                <p className="text-xs text-slate-400">Audit your school details and boot database configuration</p>
              </div>

              {/* Simulated Logs Terminal (if deploying) */}
              {deploymentLogs.length > 0 ? (
                <div className="rounded-xl border border-slate-950 bg-slate-950/80 p-5 font-mono text-[10px] leading-relaxed text-slate-400 space-y-2 select-none shadow-inner border-slate-900">
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-900">
                    <Loader2 className="h-3 w-3 text-indigo-400 animate-spin" />
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Deploying school infrastructure...</span>
                  </div>
                  {deploymentLogs.map((log, idx) => (
                    <div key={idx} className="animate-in fade-in slide-in-from-left-1 duration-200">
                      <span className="text-indigo-400 mr-1.5">&gt;</span> {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Card 1: Admin Account */}
                  <div className="rounded-xl border border-slate-900/60 bg-slate-950/20 p-4.5 text-xs space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Administrator Account</span>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Email Identity:</span>
                      <span className="font-semibold text-slate-100">{identifier}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Security Level:</span>
                      <span className="px-2 py-0.5 rounded border border-indigo-500/25 bg-indigo-500/5 text-[9px] font-bold text-indigo-300 uppercase">
                        School Administration
                      </span>
                    </div>
                  </div>

                  {/* Summary Card 2: Learners Tenency */}
                  <div className="rounded-xl border border-slate-900/60 bg-slate-950/20 p-4.5 text-xs space-y-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Tenancy School Node</span>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>School Identifier:</span>
                      <span className="font-semibold text-slate-100">{schoolName}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Assigned Slug:</span>
                      <span className="font-mono text-slate-100 font-semibold">{tenantId}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Endpoint Cluster:</span>
                      <span className="font-mono text-slate-400">{tenantId}.dsmsapp.com</span>
                    </div>
                  </div>

                  {/* Deploy Actions */}
                  <div className="flex gap-4 pt-2">
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 h-11 border-slate-800 hover:bg-slate-900 text-slate-300"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2 inline" /> Back
                    </Button>

                    <Button
                      onClick={handleDeploySchool}
                      disabled={!tenantAdminSession?.accessToken || isDeployingSchool}
                      className="flex-1 h-11 flex items-center justify-center gap-2"
                    >
                      {isDeployingSchool ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-indigo-200" />
                          Deploying School...
                        </>
                      ) : (
                        <>
                          Deploy your Driving School <Sparkles className="h-4 w-4 text-indigo-200" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* General Footer Links */}
          <div className="mt-8 text-center pt-6 border-t border-slate-900/60">
            <p className="text-xs text-slate-400">
              Already have a workspace?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          EMAIL VERIFICATION MODAL OVERLAY (GLASSMORPHIC)
      ═══════════════════════════════════════════════ */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-2xl border border-indigo-900/40 bg-slate-900/60 p-8 backdrop-blur-xl shadow-2xl shadow-indigo-950/30 text-center animate-in scale-in-95 duration-200">

            {/* Modal Icon */}
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 shadow-lg shadow-indigo-500/10 border border-indigo-500/20">
              <Mail className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Verify your Email</h3>

            <p className="text-xs leading-relaxed text-slate-400 mb-6">
              {otpDispatchStatus || (
                <>
                  Your tenant admin account has been created for <span className="font-semibold text-slate-200">{identifier}</span>. Enter the verification code to continue with school setup.
                </>
              )}
            </p>

            <form onSubmit={handleVerifyEmailCode} className="space-y-4 text-left">
              {verificationError && (
                <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-[11px] text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <div className="leading-tight">{verificationError}</div>
                </div>
              )}

              {/* Code Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verification Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter 4-digit code"
                    maxLength={4}
                    value={emailVerificationInput}
                    onChange={(e) => setEmailVerificationInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-800 bg-slate-950/50 text-sm text-slate-100 placeholder:text-slate-700 tracking-widest text-center focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 font-semibold"
                  />
                </div>
              </div>

              {/* Code Autofill Assistant */}
              <div className="rounded-lg bg-indigo-950/15 border border-indigo-500/10 p-3.5 text-[11px] leading-relaxed text-indigo-300">
                <span className="font-bold block mb-0.5">📧 Simulation Dispatcher</span>
                We have generated a mock code for verification: <span className="font-mono font-bold text-white tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-indigo-500/25 ml-1">{mockVerificationCode}</span>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  variant="outline"
                  className="flex-1 h-11 border-slate-800 hover:bg-slate-900 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={emailVerificationInput.length < 4}
                  className="flex-1 h-11"
                >
                  Verify Email
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}
