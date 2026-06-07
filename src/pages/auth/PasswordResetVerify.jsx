import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../../shared/ui/button.jsx'
import { buildBaseHostUrl } from '../../shared/config/runtime-config.js'

export default function PasswordResetVerify() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const otpInputRef = useRef(null)

  useEffect(() => {
    if (!email) {
      navigate('/resetPassword/request')
    }
  }, [email, navigate])

  useEffect(() => {
    if (otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/auth/otp/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ otp }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/resetPassword/set-password', { state: { email, otp } })
        }, 1500)
      } else {
        setError(data.message || 'Invalid verification code. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
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

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate('/resetPassword/request')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Enter Verification Code
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Enter the 6-digit code sent to {email}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                  <span className="font-semibold">Error: </span>
                  {error}
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
              >
                <CheckCircle className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                <div className="leading-normal">
                  <span className="font-semibold">Success! </span>
                  Code verified. Redirecting...
                </div>
              </motion.div>
            )}

            {/* OTP Input - 6 separate squares with single hidden input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">
                Verification Code
              </label>
              <div 
                className="flex gap-2 justify-between cursor-pointer"
                onClick={() => {
                  if (otpInputRef.current) {
                    otpInputRef.current.focus()
                  }
                }}
              >
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <div
                    key={index}
                    className="w-12 h-14 flex items-center justify-center text-2xl font-bold rounded-xl border-2 bg-white text-slate-900 transition-all duration-300 shadow-sm hover:shadow-md"
                    style={{
                      borderColor: otp[index] ? '#0f172a' : '#e2e8f0',
                      backgroundColor: otp[index] ? '#f8fafc' : 'white'
                    }}
                  >
                    {otp[index] || '-'}
                  </div>
                ))}
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(value)
                  }}
                  disabled={isLoading}
                  className="absolute opacity-0 pointer-events-none"
                  style={{ height: 0, width: 0 }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                disabled={isLoading || success || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
            </motion.div>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-slate-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={() => navigate('/resetPassword/request')}
                className="font-semibold text-slate-900 hover:text-slate-700 transition-colors"
              >
                Resend
              </button>
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
