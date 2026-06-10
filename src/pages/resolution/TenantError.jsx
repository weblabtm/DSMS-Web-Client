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
    <div className="relative flex min-h-screen items-center justify-center bg-[#f4f6f4] text-gray-900 px-4 overflow-hidden select-none font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Ambient background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] ${
          isSuspended ? 'bg-amber-500/5' : 'bg-red-500/5'
        }`} />
        <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-[#52b788]/10 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-white border border-gray-200/60 rounded-[32px] p-8 md:p-10 text-center shadow-md"
      >
        {/* Status Badge Warning/Error Icon */}
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm ${
          isSuspended 
            ? 'bg-amber-50 border-amber-100 text-amber-600' 
            : 'bg-red-50 border-red-100 text-red-500'
        }`}>
          {isSuspended ? (
            <AlertTriangle className="h-8 w-8 animate-pulse" />
          ) : (
            <ShieldAlert className="h-8 w-8 animate-pulse" />
          )}
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2.5">
          {isSuspended ? 'Access Suspended' : 'School Not Found'}
        </h1>

        {/* Message */}
        <p className="text-sm leading-relaxed text-gray-500 mb-8 px-2 font-medium">
          {isSuspended ? (
            <>
              The driving school subscription context for <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-mono">"{slug}"</span> is currently suspended. Please reach out to your school administrator or support to reactivate your portal.
            </>
          ) : (
            <>
              We could not find an active tenancy node matching the slug identifier <span className="font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md font-mono">"{slug || 'unknown'}"</span>. Please check the school ID or contact your administrator.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleBackToLogin}
            className="w-full flex items-center justify-center gap-2 h-12 bg-[#1a472a] hover:bg-[#2d6a4f] text-white font-bold rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            Return to Sign In
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full h-12 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-bold rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <Globe className="h-4.5 w-4.5" />
            Visit Landing Page
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
