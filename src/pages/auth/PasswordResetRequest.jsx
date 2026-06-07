import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../../shared/ui/button.jsx'
import { buildBaseHostUrl } from '../../shared/config/runtime-config.js'

export default function PasswordResetRequest() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail = location.state?.email || ''
  
  const [email, setEmail] = useState(prefillEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError('')

    try {
      // Call OTP generate endpoint
      const response = await fetch('http://localhost:3000/auth/otp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Navigate to verify page with email
        setTimeout(() => {
          navigate('/resetPassword/verify', { state: { email } })
        }, 2000)
      } else {
        setError(data.message || 'Failed to send reset code. Please try again.')
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
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Login</span>
          </motion.button>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Forgot Password?</h1>
            <p className="text-slate-600 text-base leading-relaxed">
              Enter your email address and we'll send you a verification code to reset your password.
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
                  Verification code sent to your email. Redirecting...
                </div>
              </motion.div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || success}
                  className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={isLoading || success || !email}
                className="w-full flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
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
              Remember your password?{' '}
              <a href="/login" className="font-semibold text-slate-900 hover:text-slate-700 transition-colors">
                Sign In
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
