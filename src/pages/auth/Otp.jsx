import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Smartphone, Key, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from '../../shared/ui/button.jsx'
import { generateOtp, validateOtp, getUnlockDetails } from '../../shared/api/authApi.js'
import { useUiStore } from '../../shared/store/uiStore'

// Mask phone number: e.g. +94712345678 -> +94xxxxxxx678 or +94xxxxx678
const maskPhoneNumber = (phone) => {
  if (!phone) return ''
  if (phone.includes('x') || phone.includes('X')) return phone

  const clean = phone.trim()
  if (clean.length <= 5) return clean

  // Preserving country code prefix (e.g. +94) and showing last 3 numbers
  const prefix = clean.startsWith('+') ? clean.slice(0, 3) : clean.slice(0, 2)
  const suffix = clean.slice(-3)
  const maskLength = clean.length - prefix.length - 3
  const mask = 'x'.repeat(maskLength > 0 ? maskLength : 5)
  return `${prefix}${mask}${suffix}`
}

export default function Otp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const showLoader = useUiStore((state) => state.showLoader)
  const hideLoader = useUiStore((state) => state.hideLoader)

  const phoneParam = searchParams.get('phone') || ''
  const emailParam = searchParams.get('email') || ''
  const mfaTokenParam = searchParams.get('mfaToken') || ''
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const actionParam = searchParams.get('action') || ''
  const tokenParam = searchParams.get('token') || ''

  // Page phases: 'request' | 'verify' | 'success' | 'expired' | 'invalid-link'
  const [phase, setPhase] = useState('request')
  
  // States
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [otpToken, setOtpToken] = useState(null)
  const [unlockEmail, setUnlockEmail] = useState('')
  const [unlockPhone, setUnlockPhone] = useState('')

  useEffect(() => {
    if (actionParam === 'unlock' && tokenParam) {
      const loadDetails = async () => {
        setIsLoading(true)
        setError(null)
        showLoader('Loading unlock details...')
        try {
          const details = await getUnlockDetails(tokenParam)
          setUnlockEmail(details.email)
          setUnlockPhone(details.phoneNumber)
        } catch (err) {
          setError(err.message || 'Your activation link has expired or is invalid. Please contact the Driving School to reactivate your account.')
          setPhase('invalid-link')
        } finally {
          setIsLoading(false)
          hideLoader()
        }
      }
      loadDetails()
    }
  }, [actionParam, tokenParam, showLoader, hideLoader])
  
  // OTP Verification Code (6 digits)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ]

  // Timer: 5 minutes (300 seconds)
  const [timeLeft, setTimeLeft] = useState(300)
  const timerRef = useRef(null)

  // Start Timer Logic
  const startTimer = () => {
    setTimeLeft(300)
    if (timerRef.current) clearInterval(timerRef.current)
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setPhase('expired')
          setTimeout(() => {
            handleRedirect(false)
          }, 2000)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Redirect back to callbackUrl with otpDone param.
  // Use React Router navigate for relative URLs to preserve SPA navigation.
  const handleRedirect = (success) => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (callbackUrl.startsWith('http://') || callbackUrl.startsWith('https://')) {
      const url = new URL(callbackUrl)
      url.searchParams.set('otpDone', String(success))
      window.location.replace(url.toString())
    } else {
      const separator = callbackUrl.includes('?') ? '&' : '?'
      navigate(`${callbackUrl}${separator}otpDone=${success}`, { replace: true })
    }
  }

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    setIsLoading(true)
    setError(null)
    showLoader('Requesting verification code...')
    try {
      const response = await generateOtp({
        phoneNumber: actionParam === 'unlock' ? unlockPhone : phoneParam,
        email: actionParam === 'unlock' ? unlockEmail : emailParam,
        mfaToken: mfaTokenParam || undefined,
        unlockToken: actionParam === 'unlock' ? tokenParam : undefined
      })
      setOtpToken(response.token)
      setPhase('verify')
      startTimer()
    } catch (err) {
      setError(err.message || 'Failed to request OTP code. Please try again.')
    } finally {
      setIsLoading(false)
      hideLoader()
    }
  }

  // Step 2: Validate OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    
    const otpCode = code.join('')
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the code.')
      return
    }

    setIsLoading(true)
    setError(null)
    showLoader('Verifying code...')
    try {
      await validateOtp({
        otp: otpCode,
        token: otpToken,
        mfaToken: mfaTokenParam,
        unlockToken: actionParam === 'unlock' ? tokenParam : undefined
      })

      if (actionParam === 'unlock') {
        setPhase('success')
        if (timerRef.current) clearInterval(timerRef.current)
        setTimeout(() => {
          navigate('/login', { replace: true })
        }, 2000)
      } else {
        // OTP verified — send control back to Login page to complete the session
        setPhase('success')
        if (timerRef.current) clearInterval(timerRef.current)
        setTimeout(() => {
          handleRedirect(true)
        }, 2000)
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.')
      // Reset inputs on incorrect attempt to permit retry
      setCode(['', '', '', '', '', ''])
      if (inputRefs[0].current) inputRefs[0].current.focus()
    } finally {
      setIsLoading(false)
      hideLoader()
    }
  }

  // Handle Input Changes for individual code boxes
  const handleInputChange = (index, value) => {
    if (isNaN(value)) return // Only allow numbers

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Take only last character
    setCode(newCode)

    // Move focus to next input box if typed a digit
    if (value && index < 5) {
      inputRefs[index + 1].current.focus()
    }
  }

  // Handle backspaces and arrow navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs[index - 1].current.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs[index + 1].current.focus()
    }
  }

  // Handle paste events (e.g. paste '123456')
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(pastedData)) return // Must be exactly 6 digits

    const digits = pastedData.split('')
    setCode(digits)
    
    // Focus last input box
    inputRefs[5].current.focus()
  }

  // Resend OTP logic
  const handleResendOtp = async () => {
    setIsLoading(true)
    setError(null)
    showLoader('Resending verification code...')
    try {
      const response = await generateOtp({
        phoneNumber: actionParam === 'unlock' ? unlockPhone : phoneParam,
        email: actionParam === 'unlock' ? unlockEmail : emailParam,
        mfaToken: mfaTokenParam || undefined,
        unlockToken: actionParam === 'unlock' ? tokenParam : undefined
      })
      setOtpToken(response.token)
      startTimer()
      setCode(['', '', '', '', '', ''])
      if (inputRefs[0].current) inputRefs[0].current.focus()
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to resend OTP code. Please try again.')
    } finally {
      setIsLoading(false)
      hideLoader()
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[450px] h-[450px] -translate-x-1/2 -translate-y-1/2 bg-indigo-600/10 rounded-full blur-[130px]" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md z-10">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-xl shadow-lg shadow-indigo-500/25 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Security Verification
            </h1>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl">
            <AnimatePresence mode="wait">

              {/* PHASE 1: REQUEST OTP */}
              {phase === 'request' && (
                <motion.div
                  key="request-phase"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <p className="text-sm text-slate-400">
                      To complete this verification request, we must send a security code to your phone number:
                    </p>
                    <div className="flex items-center justify-center gap-3 py-4">
                      <Smartphone className="h-5 w-5 text-indigo-400" />
                      <span className="text-xl font-bold tracking-wider text-white">
                        {maskPhoneNumber(actionParam === 'unlock' ? unlockPhone : phoneParam)}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-xs text-red-300">
                      <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                      <div>{error}</div>
                    </div>
                  )}

                  <Button
                    onClick={handleRequestOtp}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        Send Verification Code
                      </>
                    )}
                  </Button>

                  <button
                    onClick={() => handleRedirect(false)}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-400 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="h-3 w-3" /> Cancel and Go Back
                  </button>
                </motion.div>
              )}

              {/* PHASE 2: VERIFY OTP */}
              {phase === 'verify' && (
                <motion.div
                  key="verify-phase"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <p className="text-sm text-slate-400">
                      We've sent a 6-digit verification code to
                    </p>
                    <p className="text-base font-bold text-white tracking-wider">
                      {maskPhoneNumber(actionParam === 'unlock' ? unlockPhone : phoneParam)}
                    </p>
                  </div>

                  {/* Timer display */}
                  <div className="flex flex-col items-center justify-center py-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Code expires in</span>
                    <span className={`text-2xl font-mono font-extrabold mt-1 tracking-wider ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-xs text-red-300">
                      <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Code Input boxes */}
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="flex justify-between gap-2">
                      {code.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={inputRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleInputChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          onPaste={idx === 0 ? handlePaste : undefined}
                          className="w-12 h-14 rounded-xl border-2 border-slate-800 bg-slate-950 text-center text-xl font-extrabold text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                        />
                      ))}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || code.some(x => !x)}
                      className="w-full h-12 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4" /> Verify Code
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-center pt-2">
                    <button
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                    >
                      Didn't receive the code? Resend OTP
                    </button>
                  </div>
                </motion.div>
              )}

              {/* PHASE 3: SUCCESS REDIRECT */}
              {phase === 'success' && (
                <motion.div
                  key="success-phase"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 mb-2">
                    <CheckCircle2 className="h-10 w-10 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {actionParam === 'unlock' ? 'Account Reactivated' : 'Verification Successful'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {actionParam === 'unlock'
                      ? 'Your account has been successfully unlocked. Redirecting you to login...'
                      : 'Your identity has been verified. Redirecting you to the application...'}
                  </p>
                </motion.div>
              )}

              {/* PHASE 4: EXPIRED REDIRECT */}
              {phase === 'expired' && (
                <motion.div
                  key="expired-phase"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/25 mb-2">
                    <AlertCircle className="h-10 w-10 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Verification Expired</h3>
                  <p className="text-sm text-slate-400">
                    Verification code has expired. Redirecting back...
                  </p>
                </motion.div>
              )}

              {/* PHASE: INVALID LINK */}
              {phase === 'invalid-link' && (
                <motion.div
                  key="invalid-link-phase"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4"
                >
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/25 mb-2">
                    <AlertCircle className="h-10 w-10 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Activation Link Invalid</h3>
                  <p className="text-sm text-red-300 px-2 leading-relaxed">
                    {error || 'Your activation link has expired or is invalid. Please contact the Driving School to reactivate your account.'}
                  </p>
                  <div className="pt-4">
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-300"
                    >
                      Back to Login
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  )
}
