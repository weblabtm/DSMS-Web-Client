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
    const currentContainer = containerRef.current
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
        if (window.turnstile && currentContainer) {
          currentContainer.innerHTML = ''

          const captchaDiv = document.createElement('div')
          currentContainer.appendChild(captchaDiv)

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
      if (currentContainer) {
        currentContainer.innerHTML = ''
      }
      isRendered.current = false
    }
  }, [handleRedirect])

  return (
    <div className="relative flex min-h-screen flex-col bg-[#f4f6f4] text-gray-900 overflow-hidden font-sans">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#d8f3dc]/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#52b788]/20 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md z-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a472a] text-white font-extrabold text-xl shadow-lg shadow-[#1a472a]/20 mb-4">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Security Challenge
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Verify you're human to continue
            </p>
          </div>

          {/* Main Card */}
          <div className="rounded-3xl border border-gray-200/50 bg-white p-8 shadow-xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Please verify that you are human to continue signing in.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              {/* CAPTCHA container */}
              <div className="flex flex-col items-center justify-center py-4 min-h-[78px] gap-4">
                <div ref={containerRef} />
              </div>

              <button
                onClick={() => handleRedirect(false)}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
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
