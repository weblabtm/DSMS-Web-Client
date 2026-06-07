import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '../../shared/ui/button.jsx'
import { getGlobalRuntimeConfig } from '../../shared/config/runtime-config.js'

export default function Challenge() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  const recaptchaRef = useRef(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Dynamically load Google reCAPTCHA script
    const loadScript = () => {
      if (window.grecaptcha) {
        renderCaptcha()
        return
      }

      window.onRecaptchaLoad = () => {
        renderCaptcha()
      }

      const script = document.createElement('script')
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    const renderCaptcha = () => {
      setIsLoading(false)
      const config = getGlobalRuntimeConfig()
      const siteKey = config?.recaptchaSiteKey || '6LedABAtAAAAAOBhX3sS_v8h6g5e-eG4P-Z3t0oZ'

      try {
        if (window.grecaptcha && recaptchaRef.current) {
          window.grecaptcha.render(recaptchaRef.current, {
            sitekey: siteKey,
            callback: (token) => {
              sessionStorage.setItem('dsms_captcha_token', token)
              navigate(callbackUrl, { replace: true })
            },
            'error-callback': () => {
              setError('Failed to load CAPTCHA verification. Please reload.')
            },
            theme: 'dark'
          })
        }
      } catch (err) {
        console.error('reCAPTCHA render error:', err)
      }
    }

    loadScript()

    return () => {
      delete window.onRecaptchaLoad
    }
  }, [callbackUrl, navigate])

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
              Security Challenge
            </h1>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-400">
                  Please verify that you are human to complete your request.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-xs text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {/* CAPTCHA container */}
              <div className="flex justify-center py-4 min-h-[78px]">
                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                    Loading security check...
                  </div>
                )}
                <div ref={recaptchaRef} />
              </div>

              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-400 transition-colors"
              >
                Cancel and Go Back
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
