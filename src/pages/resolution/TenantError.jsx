import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert, AlertTriangle, LogOut, Globe } from 'lucide-react'
import { useAuth } from '../../shared/hooks/useAuth'
import { Button } from '../../shared/ui/button.jsx'

export default function TenantError() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const type = searchParams.get('type') || 'not-found'
  const slug = searchParams.get('slug') || ''

  const handleBackToLogin = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const isSuspended = type === 'suspended'

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 px-4 overflow-hidden">
      {/* Ambient background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] ${
          isSuspended ? 'bg-amber-600/15' : 'bg-red-600/15'
        }`} />
        <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-900 bg-slate-900/40 p-8 text-center backdrop-blur-xl shadow-2xl shadow-slate-950/50"
      >
        {/* Animated warning/error icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/30 shadow-lg shadow-indigo-500/5 select-none">
          {isSuspended ? (
            <div className="text-amber-400">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>
          ) : (
            <div className="text-red-400">
              <ShieldAlert className="h-8 w-8 animate-pulse" />
            </div>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3">
          {isSuspended ? 'Access Suspended' : 'School Not Found'}
        </h1>

        {/* Message */}
        <p className="text-sm leading-relaxed text-slate-400 mb-8 px-2">
          {isSuspended ? (
            <>
              The driving school subscription context for <span className="font-semibold text-amber-300 font-mono">"{slug}"</span> is currently suspended. Please reach out to your school administrator or support to reactivate your portal.
            </>
          ) : (
            <>
              We could not find an active tenancy node matching the slug identifier <span className="font-semibold text-red-300 font-mono">"{slug || 'unknown'}"</span>. Please check the school ID or contact your administrator.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleBackToLogin}
            className={`w-full flex items-center justify-center gap-2 h-12 font-semibold rounded-2xl shadow-lg transition-all duration-300 ${
              isSuspended
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-950/20'
                : 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white border border-slate-800'
            }`}
          >
            <LogOut className="h-4 w-4" />
            Return to Sign In
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full h-12 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all duration-300"
          >
            <Globe className="h-4 w-4 mr-2" />
            Visit Landing Page
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
