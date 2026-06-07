import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, AlertCircle, RefreshCw } from 'lucide-react'
import { getGlobalRuntimeConfig } from '../../shared/config/runtime-config.js'
import { validateCaptcha } from '../../shared/api/authApi.js'
import { getDeviceInfo } from '../../shared/utils/deviceInfo.js'

export default function Challenge() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/login'

  // Redirect back to callbackUrl with captchaDone param.
  // Use React Router navigate for relative URLs to preserve SPA navigation.
  const handleRedirect = useCallback((success, captchaToken = '') => {
    if (callbackUrl.startsWith('http://') || callbackUrl.startsWith('https://')) {
      const url = new URL(callbackUrl)
      url.searchParams.set('captchaDone', String(success))
      if (captchaToken) {
        url.searchParams.set('captchaToken', captchaToken)
      }
      window.location.replace(url.toString())
    } else {
      const separator = callbackUrl.includes('?') ? '&' : '?'
      let target = `${callbackUrl}${separator}captchaDone=${success}`
      if (captchaToken) {
        target += `&captchaToken=${encodeURIComponent(captchaToken)}`
      }
      navigate(target, { replace: true })
    }
  }, [callbackUrl, navigate])

  const containerRef = useRef(null)
  const isRendered = useRef(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadScript = () => {
      if (window.turnstile) {
        renderTurnstile()
        return
      }

      window.onTurnstileLoad = () => {
        renderTurnstile()
      }

      const existingScript = document.querySelector('script[src*="turnstile/v0/api.js"]')
      if (existingScript) return

      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    const renderTurnstile = () => {
      if (isRendered.current) return
      setIsLoading(false)
      const config = getGlobalRuntimeConfig()
      const siteKey = config?.captchaSiteKey || config?.recaptchaSiteKey || '0x4AAAAAADgL0IjHaom1GpZW'

      try {
        if (window.turnstile && containerRef.current) {
          containerRef.current.innerHTML = ''

          const captchaDiv = document.createElement('div')
          containerRef.current.appendChild(captchaDiv)

          isRendered.current = true
          window.turnstile.render(captchaDiv, {
            sitekey: siteKey,
            callback: async (token) => {
              setIsLoading(true)
              setError(null)
              try {
                // Gather device info for token binding
                const deviceInfo = await getDeviceInfo().catch(() => ({}))
                // Validate with server → sets captcha_verified_token cookie bound to this device
                const response = await validateCaptcha(token, deviceInfo)

                 // Return control to redirect target, passing the token
                 handleRedirect(true, response?.token)
              } catch (err) {
                setError(err.message || 'Failed to complete security challenge. Please try again.')
                isRendered.current = false
                setIsLoading(false)
              }
            },
            'error-callback': () => {
              isRendered.current = false
              setError('Failed to load Turnstile verification. Please reload.')
            },
            theme: 'dark'
          })
        }
      } catch (err) {
        isRendered.current = false
        console.error('Turnstile render error:', err)
      }
    }

    loadScript()

    return () => {
      delete window.onTurnstileLoad
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      isRendered.current = false
    }
  }, [handleRedirect])

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
                  Please verify that you are human to continue signing in.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/5 p-4 text-xs text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {/* CAPTCHA container */}
              <div className="flex flex-col items-center justify-center py-4 min-h-[78px] gap-4">
                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                    Loading security check...
                  </div>
                )}
                <div ref={containerRef} />
              </div>

              <button
                onClick={() => handleRedirect(false)}
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
