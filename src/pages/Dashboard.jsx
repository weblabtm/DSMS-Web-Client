import { useState } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  User,
  Shield,
  Server,
  MapPin,
  UserPlus,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  Info,
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { useAuth } from '../shared/hooks/useAuth'
import { useAuthStore } from '../shared/store/authStore'
import { Button } from '../shared/ui/button.jsx'
import { buildTenantPath } from '../shared/config/runtime-config.js'

const getRoleColor = (role) => {
  switch (role) {
    case 'Super Admin':
      return 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-300 shadow-red-500/5'
    case 'Tenant Admin':
      return 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-300 shadow-indigo-500/5'
    case 'Branch Manager':
      return 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-300 shadow-cyan-500/5'
    case 'Instructor':
      return 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-300 shadow-purple-500/5'
    case 'Front Desk':
      return 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300 shadow-amber-500/5'
    case 'Student':
      return 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-300 shadow-emerald-500/5'
    default:
      return 'from-slate-500/20 to-slate-500/20 border-slate-500/30 text-slate-300'
  }
}

export default function Dashboard() {
  const { user, currentRole, getInviteableRoles, logout } = useAuth()
  const { getActiveSessions, revokeSession } = useAuthStore()
  const navigate = useNavigate()
  const inviteableRoles = getInviteableRoles()
  const canInvite = inviteableRoles.length > 0

  // ── Active Sessions state ──
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [revokingId, setRevokingId] = useState(null)

  const fetchSessions = async (showLoading = true) => {
    if (showLoading) {
      setSessionsLoading(true)
    }
    try {
      const { sessions: list } = await getActiveSessions()
      setSessions(list || [])
    } catch (err) {
      console.warn('Could not load sessions:', err.message)
    } finally {
      setSessionsLoading(false)
    }
  }

  const handleRevoke = async (sessionId) => {
    setRevokingId(sessionId)
    try {
      await revokeSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
    } catch (err) {
      console.warn('Could not revoke session:', err.message)
    } finally {
      setRevokingId(null)
    }
  }

  useEffect(() => {
    if (currentRole === 'Super Admin') {
      navigate('/super-admin/dashboard', { replace: true })
    }
  }, [currentRole, navigate])

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchSessions(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // State for generator
  const [targetRole, setTargetRole] = useState(inviteableRoles[0] || '')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerateLink = () => {
    if (!targetRole) return

    // In our system, the inviter's token is their current active accessToken
    const token = user?.accessToken
    if (!token) return

    const inviteUrl = buildTenantPath(user?.tenantId, `/register?token=${token}`)

    setGeneratedLink(inviteUrl)
    setCopied(false)
  }

  const handleCopy = () => {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl h-16 flex items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-base shadow-lg shadow-indigo-500/20 shrink-0">
              D
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DSMS<span className="text-indigo-400 font-medium text-[10px] ml-1 uppercase tracking-wider">SaaS</span>
            </span>
          </Link>

          <Button
            onClick={() => logout()}
            variant="outline"
            size="sm"
            className="border-slate-800 text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        {/* Welcome Row */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Control Center
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor deployments, manage roles, and issue invitation tokens.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Col 1: Profile & Node Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Profile Info Card */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-xl shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-indigo-400" /> Active Session
              </h2>

              <div className="space-y-5">
                {/* Account Name */}
                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-900/50 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm">
                    {user?.userId?.substring(0, 2).toUpperCase() || 'US'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 truncate max-w-[180px]">
                      {user?.userId || 'N/A'}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">UID: {user?.userId?.substring(0, 8) || 'unknown'}</span>
                  </div>
                </div>

                {/* Properties */}
                <div className="space-y-3.5 text-xs">
                  {/* Role Badge */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-900/50">
                    <span className="text-slate-400 font-medium">System Role</span>
                    <span className={`px-2.5 py-0.5 rounded-full border bg-gradient-to-tr text-[10px] font-bold uppercase shadow-sm ${getRoleColor(currentRole)}`}>
                      {currentRole || 'N/A'}
                    </span>
                  </div>

                  {/* Tenant ID */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-900/50">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Server className="h-3.5 w-3.5 text-slate-500" /> Tenancy Node
                    </span>
                    <span className="text-slate-200 font-mono font-semibold">
                      {user?.tenantId || 'Central Cluster'}
                    </span>
                  </div>

                  {/* Branch ID */}
                  <div className="flex justify-between items-center py-2 border-b border-slate-900/50">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" /> Location Node
                    </span>
                    <span className="text-slate-200 font-mono font-semibold">
                      {user?.branchId || 'central_office'}
                    </span>
                  </div>

                  {/* Session Key Duration */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-slate-500" /> Session Status
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Node
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro FAQ / Hint */}
            <div className="rounded-xl border border-indigo-950/20 bg-indigo-950/5 p-5 text-xs leading-relaxed text-slate-400 flex gap-3">
              <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-200 block mb-0.5">Simulation Node Info</span>
                All auth actions automatically persist credentials inside local storage, and request fresh auth rotation tokens on start. Perfect for production node isolation.
              </div>
            </div>
          </div>

          {/* Col 2 & 3: Invite Link Generator */}
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-8 backdrop-blur-xl shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" /> Organizational Invite Generator
              </h2>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Generate localized registration invite tokens. These links allow new users to deploy their credentials inside your tenancy cluster using the backend role-permission schema.
              </p>

              {canInvite ? (
                <div className="space-y-6">
                  {/* Selector Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

                    {/* Role Selection */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Select Invitee Role
                      </label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-800 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all duration-200 cursor-pointer appearance-none"
                      >
                        {inviteableRoles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Generator Button */}
                    <div className="md:col-span-1">
                      <Button
                        onClick={handleGenerateLink}
                        disabled={!targetRole}
                        className="w-full h-11 flex items-center justify-center gap-2"
                      >
                        Generate Link
                      </Button>
                    </div>
                  </div>

                  {/* Output Invite Link */}
                  {generatedLink && (
                    <div className="mt-8 space-y-3 pt-6 border-t border-slate-900/60 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Generated Invite URL ({targetRole})
                        </span>
                        {copied && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="h-3 w-3" /> Copied to clipboard!
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 px-4 py-2.5 text-xs text-slate-300 select-all font-mono truncate">
                          {generatedLink}
                        </div>
                        <button
                          onClick={handleCopy}
                          className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-700 transition-all active:scale-[0.96] cursor-pointer"
                          title="Copy Link"
                        >
                          <Copy className="h-4.5 w-4.5" />
                        </button>

                        <a
                          href={generatedLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-indigo-900/30 bg-indigo-950/20 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 hover:border-indigo-800 transition-all active:scale-[0.96]"
                          title="Open in new tab (Test flow)"
                        >
                          <ExternalLink className="h-4.5 w-4.5" />
                        </a>
                      </div>

                      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-4 text-xs text-slate-400 leading-normal flex gap-3.5">
                        <UserPlus className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-300 block mb-0.5">Ready to Test!</span>
                          Click the <span className="font-semibold text-white">External Link</span> icon above to open an incognito/new tab window.
                          The registration page will automatically capture this session's JWT credentials, welcome you, lock the tenancy context to <span className="font-semibold text-white">{user?.tenantId || 'central'}</span>, and restrict registration options to <span className="font-semibold text-white">{targetRole}</span>!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-slate-900/50 bg-slate-950/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 mb-4 border border-indigo-500/20">
                    <User className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200">No Invite Privileges</h3>
                  <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-normal">
                    Your current account role <span className="font-bold uppercase text-slate-400">({currentRole})</span> is not authorized to issue invitation links in this workspace cluster.
                  </p>
                </div>
              )}
            </div>

            {/* ── Active Sessions Panel ── */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-400" /> Active Sessions
                </h2>
                <button
                  onClick={fetchSessions}
                  disabled={sessionsLoading}
                  className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 transition-all disabled:opacity-40 cursor-pointer"
                  title="Refresh sessions"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${sessionsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {sessionsLoading && sessions.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-6">Loading sessions…</div>
              ) : sessions.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-6">No active sessions found.</div>
              ) : (
                <ul className="space-y-2">
                  {sessions.map((s) => {
                    const platform = s.devicePlatform || 'Desktop'
                    const PlatformIcon = platform === 'Mobile' ? Smartphone : platform === 'Tablet' ? Tablet : Monitor
                    const isCurrentSession = s.sessionId === user?.sessionId
                    return (
                      <li
                        key={s.sessionId}
                        className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs transition-all ${
                          isCurrentSession
                            ? 'border-indigo-800/50 bg-indigo-950/20'
                            : 'border-slate-800/50 bg-slate-950/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <PlatformIcon className={`h-4 w-4 shrink-0 ${isCurrentSession ? 'text-indigo-400' : 'text-slate-500'}`} />
                          <div>
                            <div className="font-semibold text-slate-200">
                              {s.deviceOs || 'Unknown OS'}
                              {isCurrentSession && (
                                <span className="ml-2 text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 rounded px-1.5 py-0.5">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 mt-0.5">
                              {platform} · Signed in {new Date(s.createdAt * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {!isCurrentSession && (
                          <button
                            onClick={() => handleRevoke(s.sessionId)}
                            disabled={revokingId === s.sessionId}
                            className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-500 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/20 transition-all disabled:opacity-40 cursor-pointer"
                            title="Revoke this session"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Simulated Live Terminal logs */}
            <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-6 backdrop-blur-xl shadow-2xl">
              <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2 font-mono">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block animate-pulse" /> SIMULATION_TERMINAL_LOGS
              </h2>

              <div className="bg-slate-950 rounded-lg p-4 font-mono text-[10px] text-slate-400 space-y-1.5 leading-normal border border-slate-900 select-none">
                <div><span className="text-indigo-400">[info]</span> Booting auth module rehydration sequence...</div>
                <div><span className="text-indigo-400">[info]</span> Found cached credentials. Verifying session integrity...</div>
                <div><span className="text-emerald-400">[success]</span> Decoded claims: sub={user?.userId?.substring(0, 8)}, tenant={user?.tenantId || 'central'}, role={currentRole}</div>
                <div><span className="text-indigo-400">[info]</span> Token refresh triggered: rotating refresh token...</div>
                <div><span className="text-emerald-400">[success]</span> Session rotated and initialized. Active listener deployed.</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
