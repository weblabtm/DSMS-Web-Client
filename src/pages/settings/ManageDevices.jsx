import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Monitor, Smartphone, Globe, Clock, Shield, LogOut, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { Button } from '../../shared/ui/button.jsx'
import { useAuthStore } from '../../shared/store/authStore.js'

export default function ManageDevices() {
  const navigate = useNavigate()
  const getActiveSessions = useAuthStore((state) => state.getActiveSessions)
  const revokeSession     = useAuthStore((state) => state.revokeSession)
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [revokingId, setRevokingId] = useState(null)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchSessions = useCallback(async () => {
    await Promise.resolve()
    setIsLoading(true)
    setError('')
    try {
      const { sessions, currentSessionId } = await getActiveSessions()
      setCurrentSessionId(currentSessionId ?? null)
      setSessions(sessions ?? [])
    } catch {
      setError('Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }, [getActiveSessions])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions()
  }, [fetchSessions])

  const handleRevoke = async (sessionId) => {
    setRevokingId(sessionId)
    setError('')
    setSuccess('')

    try {
      await revokeSession(sessionId)
      setSessions(sessions.filter(s => s.sessionId !== sessionId))
      setSuccess('Session revoked successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to revoke session. Please try again.')
    } finally {
      setRevokingId(null)
    }
  }

  const handleRevokeAll = async () => {
    const nonCurrentSessions = sessions.filter(s => s.sessionId !== currentSessionId)
    if (nonCurrentSessions.length === 0) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Revoke each non-current session via the store action (which uses proper auth headers)
      await Promise.all(nonCurrentSessions.map(session => revokeSession(session.sessionId)))
      await fetchSessions()
      setSuccess(`Revoked ${nonCurrentSessions.length} session(s) successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to revoke sessions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastActive = (timestamp, now) => {
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  const getDeviceIcon = (devicePlatform) => {
    const platform = devicePlatform?.toLowerCase() || ''
    return platform.includes('mobile') || platform.includes('ios') || platform.includes('android') ? Smartphone : Monitor
  }

  const getDeviceName = (deviceOs, devicePlatform) => {
    const os = deviceOs || 'Unknown Device'
    const platform = devicePlatform || ''
    if (platform.includes('mobile') || platform.includes('ios') || platform.includes('android')) {
      return os.includes('iOS') ? 'iPhone/iPad' : 'Android Device'
    }
    return os.includes('Windows') ? 'Windows PC' : os.includes('Mac') ? 'Mac' : 'Desktop'
  }

  const getBrowserName = (devicePlatform) => {
    const platform = devicePlatform?.toLowerCase() || ''
    if (platform.includes('chrome')) return 'Chrome'
    if (platform.includes('firefox')) return 'Firefox'
    if (platform.includes('safari')) return 'Safari'
    if (platform.includes('edge')) return 'Edge'
    return 'Web Browser'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </motion.button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Manage Devices</h1>
              <p className="text-xs text-slate-500">View and manage your active sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSessions}
              disabled={isLoading}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            <CheckCircle className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
            <div className="leading-normal">
              <span className="font-semibold">Success! </span>
              {success}
            </div>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-900">Active Sessions</h3>
              <p className="mt-1 text-sm text-slate-600">
                Manage your active sessions across devices. You can revoke access from any device remotely.
                Revoking a session will immediately log out that device.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center"
          >
            <Monitor className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-base font-semibold text-slate-900">No active sessions</h3>
            <p className="mt-2 text-sm text-slate-600">You don't have any active sessions on other devices.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Revoke All Button */}
            {sessions.filter(s => s.sessionId !== currentSessionId).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeAll}
                  disabled={isLoading}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Revoke All Other Sessions
                </Button>
              </motion.div>
            )}

            {/* Session Cards */}
            {sessions.map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.devicePlatform)
              const isCurrent = session.sessionId === currentSessionId
              const deviceName = getDeviceName(session.deviceOs, session.devicePlatform)
              const browserName = getBrowserName(session.devicePlatform)
              return (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl border p-6 shadow-sm ${
                    isCurrent
                      ? 'border-blue-200 bg-blue-50/50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`rounded-xl p-3 ${
                        isCurrent
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <DeviceIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">
                            {deviceName}
                          </h3>
                          {isCurrent && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-slate-400" />
                            <span>{browserName} on {session.deviceOs || 'Unknown OS'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>Last active: {formatLastActive(session.createdAt * 1000, currentTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-slate-400" />
                            <span className="text-xs text-slate-500">Session ID: {session.sessionId.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(session.sessionId)}
                        disabled={revokingId === session.sessionId}
                        className="border-red-300 text-red-700 hover:bg-red-50 shrink-0"
                      >
                        {revokingId === session.sessionId ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-700 border-t-transparent mr-2" />
                            Revoking...
                          </>
                        ) : (
                          <>
                            <LogOut className="mr-2 h-4 w-4" />
                            Revoke
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
