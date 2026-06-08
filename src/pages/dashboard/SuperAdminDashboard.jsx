import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield, Database, Layers3, Building2, Users, ArrowRight, LogOut,
  CheckCircle, AlertCircle, Lock, ChevronLeft, ChevronRight,
  Search, Bell, ChevronDown, Monitor, Smartphone, Tablet,
  Settings, User, Plus, X, MessageCircle, RefreshCw
} from 'lucide-react'
import { useAuth } from '../../shared/hooks/useAuth'
import { useAuthStore } from '../../shared/store/authStore'

// ==========================================
// REUSABLE SUB-COMPONENTS (Donezo Design)
// ==========================================

function DonezoLogo() {
  return (
    <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28Z"
        stroke="#1a472a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14C10 11.5 12 11.5 13.5 13.5C15 15.5 16 15.5 16 15.5C16 15.5 17 15.5 18.5 13.5C20 11.5 22 11.5 22 14C22 18.5 16 22 16 22C16 22 10 18.5 10 14Z"
        stroke="#1a472a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Badge({ variant = 'default', children }) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    completed: 'bg-[#d1fae5] text-[#065f46]',
    pending: 'bg-[#fee2e2] text-[#991b1b]',
    info: 'bg-blue-50 text-blue-700',
    warning: 'bg-amber-50 text-amber-700',
    green: 'bg-[#d8f3dc] text-[#1a472a]',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${variants[variant]}`}>
      {children}
    </span>
  )
}

function Button({ variant = 'primary', size = 'md', icon, children, onClick, disabled, className = '' }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98]";
  const variants = {
    primary: "bg-[#1a472a] text-white hover:bg-[#2d6a4f] focus:ring-[#1a472a]",
    outline: "border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-300",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
    success: "bg-[#52b788] text-white hover:bg-[#3da06e] focus:ring-[#52b788]",
    secondary: "bg-[#d8f3dc] text-[#1a472a] hover:bg-[#c3e6cb] focus:ring-[#52b788]",
  };
  const sizes = {
    xs: "text-xs px-2.5 py-1.5",
    sm: "text-sm px-3 py-2",
    md: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}



function StatCard({ label, value, trendLabel, icon: Icon, hero, badge }) {
  return (
    <div className={`relative rounded-2xl p-5 shadow-sm border border-gray-150 flex flex-col hover:scale-[1.02] transition-all duration-200 ${hero ? 'bg-[#1a472a] text-white border-[#1a472a]/20' : 'bg-white text-gray-900'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${hero ? 'bg-white/10 text-white' : 'bg-[#d8f3dc] text-[#1a472a]'}`}>
          <Icon className="h-5 w-5" />
        </div>
        {badge}
      </div>
      <p className={`text-xs font-semibold uppercase tracking-wider ${hero ? 'text-white/70' : 'text-gray-400'}`}>{label}</p>
      <p className="text-3xl font-extrabold mt-1 leading-none">{value}</p>
      {trendLabel && (
        <p className={`text-[10px] mt-2 font-medium ${hero ? 'text-white/60' : 'text-gray-400'}`}>{trendLabel}</p>
      )}
    </div>
  )
}

function Card({ title, headerAction, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200/50 p-5 ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-bold text-gray-900 text-base tracking-tight">{title}</h3>}
          {headerAction}
        </div>
      )}
      {children}
    </div>
  )
}

// ==========================================
// CHARTS & PROGRESS BARS (SVG Inline)
// ==========================================

function LineChart({ data, color = "#1a472a" }) {
  if (!data.length) return null;
  const width = 500;
  const height = 120;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const xStep = width / (data.length - 1);
  const yScale = (v) => height - ((v - min) / (max - min || 1)) * (height * 0.8) - height * 0.1;
  const points = data.map((d, i) => `${i * xStep},${yScale(d.value)}`).join(" ");
  const areaPoints = `0,${height} ${points} ${(data.length - 1) * xStep},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#lineGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <circle key={i} cx={i * xStep} cy={yScale(d.value)} r="3.5"
          fill="white" stroke={color} strokeWidth="2" />
      ))}
    </svg>
  );
}

function PillBarChart({ data, height = 80 }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const pct = d.value / max;
        const barH = Math.max(pct * (height - 20), 8);
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="relative w-full flex justify-center" style={{ height: height - 16 }}>
              <div className="absolute bottom-0 w-full max-w-[16px] rounded-full bg-gray-100" style={{ height: '100%', borderRadius: '999px' }} />
              <div
                className="absolute bottom-0 w-full max-w-[16px] rounded-full transition-all duration-700"
                style={{
                  height: `${barH}px`,
                  background: d.active ? "#52b788" : "#1a472a",
                  borderRadius: "999px",
                }}
              />
            </div>
            <span className="text-[9px] text-gray-400 font-semibold">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ segments, size = 100, thickness = 14 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const segmentsWithOffsets = segments.map((seg, idx) => {
    const dash = (seg.value / total) * circumference;
    const prevDashesSum = segments.slice(0, idx).reduce((sum, s) => {
      const prevDash = (s.value / total) * circumference;
      return sum + prevDash;
    }, 0);
    return { ...seg, dash, offset: prevDashesSum };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {segmentsWithOffsets.map((seg, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={seg.color} strokeWidth={thickness}
          strokeDasharray={`${seg.dash} ${circumference}`}
          strokeDashoffset={-seg.offset} strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function DonutWithLabel({ value, label, segments }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <DonutChart segments={segments} />
      <div className="absolute text-center">
        <p className="text-lg font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full bg-[#1a472a] rounded-full transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  )
}

// ==========================================
// SYSTEM ACTIVITY LOGS (local mock)
// ==========================================

const systemActivities = [
  { user: 'System', task: 'Loaded tenant routing index', status: 'completed', statusLabel: 'Completed', time: '2 mins ago' },
  { user: 'Scheduler', task: 'Policy engine refreshed RBAC scopes', status: 'info', statusLabel: 'In Sync', time: '18 mins ago' },
  { user: 'Monitor', task: 'Detected transient latency spike', status: 'warning', statusLabel: 'Investigate', time: '45 mins ago' },
]

// ==========================================
// NOTIFICATIONS POPOVER
// ==========================================

function NotificationPopover({ notifications, onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-200/50 shadow-sm text-gray-500 hover:text-gray-700 transition-all hover:bg-gray-50 cursor-pointer"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
            <span className="text-xs font-extrabold text-gray-900">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={() => { onMarkAllRead(); setOpen(false); }} className="text-[10px] font-bold text-[#1a472a] hover:underline cursor-pointer">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No new alerts.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} onClick={() => { onMarkRead(n.id); setOpen(false); }} className={`flex gap-3 p-3 text-left hover:bg-gray-50 cursor-pointer transition-colors ${n.unread ? 'bg-[#f0fdf4]/50' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${n.type === 'success' ? 'bg-[#d1fae5] text-[#065f46]' :
                      n.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                    {n.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800">{n.title}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-normal">{n.body}</p>
                    <p className="text-[8px] text-gray-400 mt-1 font-semibold">{n.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// GENERIC MODALS & DROPDOWNS
// ==========================================

function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-2xl w-full ${widths[size]} flex flex-col max-h-[90vh] overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-end gap-3 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(p => !p)}>{trigger}</div>
      {open && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 absolute right-0 mt-1.5 w-44">
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1 border-t border-gray-50" />
            ) : (
              <button key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer
                  ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-[#f4f6f4]'}`}>
                {item.icon && <span className="text-gray-400 flex-shrink-0">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm bg-white pointer-events-auto animate-in slide-in-from-bottom-5 duration-300
            ${toast.type === "success" ? "border-[#52b788]" :
              toast.type === "error" ? "border-red-300" : "border-gray-200"}`}>
          <span className={`mt-0.5 ${toast.type === "success" ? "text-[#1a472a]" : "text-red-500"}`}>
            {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          </span>
          <div className="flex-1">
            {toast.title && <p className="text-xs font-bold text-gray-800">{toast.title}</p>}
            <p className="text-xs text-gray-600 mt-0.5 leading-normal">{toast.message}</p>
          </div>
          <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// MAIN SUPER ADMIN DASHBOARD COMPONENT
// ==========================================

export default function SuperAdminDashboard() {
  const { currentRole, logout } = useAuth()
  const { getActiveSessions, revokeSession } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentRole !== 'Super Admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [currentRole, navigate])

  // UI States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, tenants, sessions, settings
  const [loading, setLoading] = useState(false)

  // Settings & Profile mock states
  const [currentUser, setCurrentUser] = useState({
    name: 'Platform Operator #1',
    email: 'admin@donezo-infra.com',
    bio: 'System controller overseeing clusters, microservices, and tenant routing databases.'
  })

  // Toast systems
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((type, title, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Tenant provisioned', body: 'Tenant Space "apex-school" configured successfully.', time: '5 mins ago', unread: true },
    { id: 2, type: 'warning', title: 'Database load alert', body: 'Base database storage cluster usage at 76%.', time: '1 hour ago', unread: true },
    { id: 3, type: 'info', title: 'Global SSL renewed', body: 'SSL certification validated for all tenant subdomains.', time: '5 hours ago', unread: false }
  ])

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    addToast('success', 'Notifications updated', 'All platform logs marked as read.')
  }

  // Active Sessions
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [revokingId, setRevokingId] = useState(null)

  const fetchSessions = async (showToast = true) => {
    if (showToast) setSessionsLoading(true)
    try {
      const list = await getActiveSessions()
      setSessions(list)
      if (showToast) {
        addToast('success', 'Sessions loaded', 'Operator connection sessions updated.')
      }
    } catch (err) {
      addToast('error', 'Session fetch failed', err.message || 'Could not fetch operator sessions.')
    } finally {
      setSessionsLoading(false)
    }
  }

  const handleRevoke = async (sessionId) => {
    setRevokingId(sessionId)
    try {
      await revokeSession(sessionId)
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId))
      addToast('success', 'Session terminated', 'Target console connection revoked.')
    } catch (err) {
      addToast('error', 'Revocation failed', err.message || 'Could not close console session.')
    } finally {
      setRevokingId(null)
    }
  }

  // Tenants data states
  const [tenants, setTenants] = useState([
    { id: 1, name: 'Acme Academy', slug: 'acme-academy', status: 'completed', statusLabel: 'Active', plan: 'Enterprise', members: 14, created: '2026-01-15' },
    { id: 2, name: 'Apex Driving School', slug: 'apex-driving', status: 'completed', statusLabel: 'Active', plan: 'Standard', members: 6, created: '2026-02-10' },
    { id: 3, name: 'Central instructors', slug: 'central-instruct', status: 'progress', statusLabel: 'Suspended', plan: 'Starter', members: 2, created: '2026-03-01' },
    { id: 4, name: 'Elite Road Prep', slug: 'elite-road-prep', status: 'completed', statusLabel: 'Active', plan: 'Enterprise', members: 18, created: '2026-04-18' },
    { id: 5, name: 'Global Logistics Acad', slug: 'global-logistics', status: 'pending', statusLabel: 'Inactive', plan: 'Standard', members: 0, created: '2026-05-02' }
  ])

  // Tenant Provision Modal states
  const [tenantModalOpen, setTenantModalOpen] = useState(false)
  const [newTenantName, setNewTenantName] = useState('')
  const [newTenantSlug, setNewTenantSlug] = useState('')
  const [newTenantPlan, setNewTenantPlan] = useState('Standard')

  const handleAddTenant = () => {
    if (!newTenantName.trim() || !newTenantSlug.trim()) {
      addToast('error', 'Validation Failure', 'Tenant name and slug are required.')
      return
    }
    const matchedSlug = tenants.some(t => t.slug.toLowerCase() === newTenantSlug.toLowerCase())
    if (matchedSlug) {
      addToast('error', 'Slug Conflict', 'This subdomain slug is already owned.')
      return
    }
    const newTenantObj = {
      id: Date.now(),
      name: newTenantName,
      slug: newTenantSlug.toLowerCase().replace(/\s+/g, '-'),
      status: 'completed',
      statusLabel: 'Active',
      plan: newTenantPlan,
      members: 1,
      created: new Date().toISOString().split('T')[0]
    }
    setTenants(prev => [newTenantObj, ...prev])
    addToast('success', 'Tenant Provisioned', `Tenant workspace "${newTenantName}" configured successfully.`)
    setTenantModalOpen(false)
    setNewTenantName('')
    setNewTenantSlug('')
    setNewTenantPlan('Standard')
  }

  // Tenant list search and filters
  const [tenantSearch, setTenantSearch] = useState('')
  const [tenantStatusFilter, setTenantStatusFilter] = useState('All') // All, Active, Suspended, Inactive
  const [tenantPlanFilter, setTenantPlanFilter] = useState('All') // All, Enterprise, Standard, Starter

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(tenantSearch.toLowerCase()) || t.slug.toLowerCase().includes(tenantSearch.toLowerCase())
      const matchesStatus = tenantStatusFilter === 'All' ||
        (tenantStatusFilter === 'Active' && t.statusLabel === 'Active') ||
        (tenantStatusFilter === 'Suspended' && t.statusLabel === 'Suspended') ||
        (tenantStatusFilter === 'Inactive' && t.statusLabel === 'Inactive')
      const matchesPlan = tenantPlanFilter === 'All' || t.plan === tenantPlanFilter
      return matchesSearch && matchesStatus && matchesPlan
    })
  }, [tenants, tenantSearch, tenantStatusFilter, tenantPlanFilter])

  // Sync / loading simulations
  const triggerSimulatedLoad = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      addToast('success', 'Cluster Synced', 'Global router tables re-indexed.')
    }, 1200)
  }

  // Load active sessions on start
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchSessions(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sidebar Layout Navigation
  const NAV_ITEMS = [
    { icon: Shield, label: 'Dashboard', id: 'dashboard' },
    { icon: Building2, label: 'Tenants Admin', id: 'tenants', badge: String(tenants.length) },
    { icon: Monitor, label: 'Console Nodes', id: 'sessions' }
  ]

  const GENERAL_ITEMS = [
    { icon: Settings, label: 'Settings', id: 'settings' },
    { icon: LogOut, label: 'Logout', id: 'logout' }
  ]

  // Mock charts static data
  const pillChartData = [
    { label: 'Mon', value: 24 }, { label: 'Tue', value: 42 },
    { label: 'Wed', value: 30 }, { label: 'Thu', value: 65, active: true },
    { label: 'Fri', value: 38 }, { label: 'Sat', value: 15 },
    { label: 'Sun', value: 20 }
  ]

  const lineChartData = [
    { value: 45 }, { value: 60 }, { value: 55 }, { value: 72 },
    { value: 62 }, { value: 85 }, { value: 78 }, { value: 95 }
  ]

  return (
    <div className="flex h-screen bg-[#f4f6f4] overflow-hidden text-gray-800 p-5 gap-5 font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Toast Overlay */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* COLLAPSIBLE SIDEBAR */}
      <aside className={`relative flex flex-col bg-white rounded-[24px] shadow-sm border border-gray-200/50 transition-all duration-300 ease-in-out z-30 h-full ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        <button
          onClick={() => setSidebarCollapsed(p => !p)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logo */}
        <div className={`flex items-center gap-3 px-6 py-5 ${sidebarCollapsed ? 'justify-center px-4' : ''}`}>
          <DonezoLogo />
          {!sidebarCollapsed && <span className="font-bold text-xl text-gray-900 tracking-tight">Donezo</span>}
        </div>

        {/* Sidebar Nav section */}
        <nav className="flex-1 px-0 space-y-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <p className="px-6 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              OPERATOR CONTROL
            </p>
          )}
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 pl-6 pr-4 py-2.5 text-sm font-semibold transition-all cursor-pointer relative
                  ${sidebarCollapsed ? 'justify-center px-3 pl-3' : ''}
                  ${active ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#1a472a] rounded-r-md" />
                )}
                <Icon size={18} className={`flex-shrink-0 ${active ? 'text-[#1a472a]' : ''}`} />
                {!sidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-lg font-bold ml-auto bg-[#52b788] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}

          {!sidebarCollapsed && (
            <p className="px-6 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              SETTINGS
            </p>
          )}
          {sidebarCollapsed && <div className="my-3 border-t border-gray-100" />}
          {GENERAL_ITEMS.map(item => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'logout') {
                    logout()
                  } else {
                    setActiveTab(item.id)
                  }
                }}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 pl-6 pr-4 py-2.5 text-sm font-semibold transition-all cursor-pointer relative
                  ${sidebarCollapsed ? 'justify-center px-3 pl-3' : ''}
                  ${active ? 'text-gray-900 font-bold' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#1a472a] rounded-r-md" />
                )}
                <Icon size={18} className={`flex-shrink-0 ${active ? 'text-[#1a472a]' : ''}`} />
                {!sidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Promo sidebar item */}
        {!sidebarCollapsed && (
          <div className="mx-4 mb-4 mt-auto p-4 rounded-[20px] bg-gradient-to-br from-[#081c15] to-[#1b4332] text-white relative overflow-hidden shadow-lg border border-white/5">
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-[#52b788]/10 rounded-full blur-xl pointer-events-none" />

            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white mb-3">
              <Lock size={16} />
            </div>

            <h4 className="font-bold text-sm text-white leading-snug mb-1">
              Secure Operations
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed mb-4">
              Base host is locked. Subdomains are sandboxed.
            </p>
          </div>
        )}
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col flex-1 overflow-hidden h-full">
        {/* TOPBAR */}
        <header className="flex items-center justify-between gap-4 pb-4 bg-transparent z-20 shrink-0">
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-gray-200/50 shadow-sm">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                placeholder="Search global databases..."
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
                disabled
              />
              <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[10px] text-gray-400 font-mono select-none">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Popover alerts */}
            <NotificationPopover
              notifications={notifications}
              onMarkRead={markNotificationRead}
              onMarkAllRead={markAllNotificationsRead}
            />

            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-200/50 shadow-sm text-gray-500 hover:text-gray-700 transition-all hover:bg-gray-50 cursor-pointer">
              <MessageCircle size={18} />
            </button>

            {/* Profile trigger */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-gray-200/50 shadow-sm hover:bg-gray-50 transition-all text-left cursor-pointer">
                  <Avatar name={currentUser.name} size="sm" online />
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-800 leading-none">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">super_admin_context</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
              }
              items={[
                { label: 'View Profile', icon: <User size={14} />, onClick: () => setActiveTab('settings') },
                { label: 'Platform Settings', icon: <Settings size={14} />, onClick: () => setActiveTab('settings') },
                { divider: true },
                { label: 'Log out', icon: <LogOut size={14} />, onClick: () => logout(), danger: true }
              ]}
            />
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className="flex-1 overflow-y-auto bg-transparent pr-1 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1a472a] border-t-transparent" />
              <span className="text-sm font-semibold text-gray-600">Reindexing cluster nodes...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Page header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">Platform Control</h1>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-semibold">Oversee tenant metrics, policy engines, and platform logs.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button variant="outline" icon={<RefreshCw size={14} />} onClick={triggerSimulatedLoad}>Sync Clusters</Button>
                      <Button variant="primary" icon={<Plus size={14} />} onClick={() => setTenantModalOpen(true)}>Provision Tenant</Button>
                    </div>
                  </div>

                  {/* Hero overview */}
                  <div className="relative rounded-[24px] p-8 bg-gradient-to-br from-[#081c15] to-[#1b4332] text-white overflow-hidden shadow-lg border border-white/5">
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#52b788]/10 rounded-full blur-2xl pointer-events-none" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#52b788]">Platform Overview</p>
                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Isolated Control Workspace</h1>
                    <p className="mt-3 text-xs sm:text-sm text-white/70 leading-relaxed max-w-2xl font-medium">
                      This workspace manages top-layer microservices, tenant registration bounds, and routing maps.
                      Operations run on the base host and are completely segmented from tenant database tables.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link to="/dashboard" className="inline-flex">
                        <button className="py-2 px-4 rounded-xl bg-[#d8f3dc] hover:bg-[#c3e6cb] text-[#1a472a] text-xs font-extrabold transition-all hover:scale-[1.02] cursor-pointer shadow-sm flex items-center gap-2">
                          View Tenant Roster <ArrowRight className="h-4 w-4" />
                        </button>
                      </Link>
                      <button onClick={() => addToast('success', 'Security Scan Active', 'System scanning is active.')} className="py-2 px-4 rounded-xl bg-[#52b788] hover:bg-[#409c70] text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-sm">
                        Inspect Firewall
                      </button>
                    </div>
                  </div>

                  {/* 4-Up Stat cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Active Tenants" value={String(tenants.filter(t => t.statusLabel === 'Active').length)} icon={Building2} trendLabel="Tenant clusters active" />
                    <StatCard label="Platform Users" value="8.4k" icon={Users} trendLabel="Combined database users" />
                    <StatCard label="Cluster Health" value="Healthy" icon={Database} badge={<Badge variant="completed">Active</Badge>} trendLabel="Database socket state OK" />
                    <StatCard label="Active Policies" value="42" icon={Layers3} trendLabel="RBAC active mapping scopes" />
                  </div>

                  {/* Charts row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance chart */}
                    <Card title="Global Performance API Calls" className="lg:col-span-2">
                      <div className="mb-6 h-36 w-full">
                        <LineChart data={lineChartData} />
                      </div>
                      <PillBarChart data={pillChartData} />
                    </Card>

                    {/* Node status / quota */}
                    <div className="space-y-6">
                      <Card title="Active Sessions Status" className="flex flex-col items-center justify-center text-center">
                        <div className="my-2">
                          <DonutWithLabel value={`${Math.round((sessions.length / 10) * 100)}%`} label="Uptime Slots" segments={[
                            { value: sessions.length, color: '#1a472a' },
                            { value: 10 - sessions.length, color: '#fee2e2' }
                          ]} />
                        </div>
                        <div className="w-full space-y-2 mt-4 text-left">
                          <div className="flex justify-between text-[11px] font-bold text-gray-500">
                            <span>Allocated Slots</span>
                            <span>{sessions.length}/10 slots</span>
                          </div>
                          <ProgressBar value={Math.round((sessions.length / 10) * 100)} />
                        </div>
                      </Card>

                      <div className="rounded-[24px] border border-[#52b788]/20 bg-[#d8f3dc] p-5 text-sm text-[#1a472a] flex items-start gap-4">
                        <div className="bg-[#1a472a] text-white p-2 rounded-xl flex-shrink-0">
                          <Lock className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-[#1a472a] tracking-tight">Security Alert</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-[#1a472a]/80 font-semibold">
                            Base host is protected. Never open Super Admin control panels under tenant subdomains.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logs terminal & activity grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity logs */}
                    <div className="lg:col-span-2">
                      <Card title="System Activity Logs">
                        <ul className="divide-y divide-gray-150">
                          {systemActivities.map((item, i) => (
                            <li key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-800 truncate">{item.user}</p>
                                <p className="text-[10px] text-gray-400 truncate mt-0.5 font-medium">
                                  {item.task}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <Badge variant={item.status}>{item.statusLabel}</Badge>
                                <span className="text-[8px] text-gray-400 font-semibold">{item.time}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>

                    {/* Live console logs */}
                    <Card title="Control Terminal" className="flex flex-col">
                      <div className="bg-[#0b130e] rounded-xl p-4 font-mono text-[9px] text-[#86efac]/85 space-y-1.5 leading-normal border border-[#1a472a]/30 shadow-inner flex-1 max-h-48 overflow-y-auto">
                        <div><span className="text-[#52b788] font-bold">[boot]</span> Loaded Donezo operator console...</div>
                        <div><span className="text-[#52b788] font-bold">[info]</span> Handshake bound: auth_scope="Super Admin"</div>
                        <div><span className="text-white font-extrabold">[success]</span> Reindexed 5 primary subdomains.</div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB 2: TENANTS ADMINISTRATION */}
              {activeTab === 'tenants' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">Tenants Directory</h1>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-semibold">Inspect and configure tenant spaces mapped to the platform.</p>
                    </div>
                    <Button variant="primary" icon={<Plus size={14} />} onClick={() => setTenantModalOpen(true)}>Configure Tenant</Button>
                  </div>

                  {/* Filter and search bar */}
                  <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-200/50">
                    <div className="flex-1 w-full relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        value={tenantSearch}
                        onChange={e => setTenantSearch(e.target.value)}
                        placeholder="Search by name or slug..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#52b788] transition-colors"
                      />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto shrink-0">
                      <select
                        value={tenantStatusFilter}
                        onChange={e => setTenantStatusFilter(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#52b788] transition-colors"
                      >
                        <option value="All">All States</option>
                        <option value="Active">Active Only</option>
                        <option value="Suspended">Suspended Only</option>
                        <option value="Inactive">Inactive Only</option>
                      </select>

                      <select
                        value={tenantPlanFilter}
                        onChange={e => setTenantPlanFilter(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-[#52b788] transition-colors"
                      >
                        <option value="All">All Plans</option>
                        <option value="Enterprise">Enterprise</option>
                        <option value="Standard">Standard</option>
                        <option value="Starter">Starter</option>
                      </select>
                    </div>
                  </div>

                  {/* Tenants table */}
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="px-4 py-3">Tenant Name</th>
                            <th className="px-4 py-3">Subdomain Slug</th>
                            <th className="px-4 py-3">Billing Plan</th>
                            <th className="px-4 py-3">Members</th>
                            <th className="px-4 py-3">Registration Date</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-700">
                          {filteredTenants.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-gray-400 font-semibold">No tenant configurations match the filters.</td>
                            </tr>
                          ) : (
                            filteredTenants.map(t => (
                              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4 font-bold text-gray-950">{t.name}</td>
                                <td className="px-4 py-4 font-mono text-[11px] text-gray-500">{t.slug}.dsms-platform.com</td>
                                <td className="px-4 py-4 font-semibold">{t.plan}</td>
                                <td className="px-4 py-4 font-medium">{t.members} users</td>
                                <td className="px-4 py-4 text-gray-400">{t.created}</td>
                                <td className="px-4 py-4">
                                  <Badge variant={t.status}>{t.statusLabel}</Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 3: OPERATOR CONSOLE NODES */}
              {activeTab === 'sessions' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">Operator Console Nodes</h1>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-semibold">Inspect and revoke active operator sessions connected to this workstation.</p>
                    </div>
                    <Button variant="outline" icon={<RefreshCw size={14} />} onClick={() => fetchSessions(true)}>Refresh Nodes</Button>
                  </div>

                  <Card>
                    {sessionsLoading ? (
                      <div className="text-xs text-gray-400 text-center py-6">Connecting session database...</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              <th className="px-4 py-3">Platform</th>
                              <th className="px-4 py-3">Operating System</th>
                              <th className="px-4 py-3">Registered Timestamp</th>
                              <th className="px-4 py-3">Scope Boundary</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-gray-700">
                            {sessions.map(s => {
                              const platform = s.devicePlatform || 'Desktop'
                              const PlatformIcon = platform === 'Mobile' ? Smartphone : platform === 'Tablet' ? Tablet : Monitor
                              const isCurrent = s.sessionId === useAuthStore.getState().user?.sessionId
                              return (
                                <tr key={s.sessionId} className={isCurrent ? 'bg-[#f0fdf4]/30' : ''}>
                                  <td className="px-4 py-4 font-bold flex items-center gap-2">
                                    <PlatformIcon size={15} className="text-slate-400" />
                                    {platform}
                                  </td>
                                  <td className="px-4 py-4 font-semibold text-gray-900">{s.deviceOs || 'Unknown OS'}</td>
                                  <td className="px-4 py-4 text-gray-400">{new Date(s.createdAt * 1000).toLocaleString()}</td>
                                  <td className="px-4 py-4">
                                    {isCurrent ? (
                                      <Badge variant="green">Current Console</Badge>
                                    ) : (
                                      <Badge variant="completed">Active Node</Badge>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    {!isCurrent && (
                                      <Button
                                        variant="outline"
                                        size="xs"
                                        icon={<X size={12} />}
                                        onClick={() => handleRevoke(s.sessionId)}
                                        disabled={revokingId === s.sessionId}
                                      >
                                        Terminate
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* TAB 4: OPERATOR SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">Platform Settings</h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 font-semibold">Configure operator workspace credentials and preferences.</p>
                  </div>

                  <Card className="max-w-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 pb-4 border-b border-gray-50">
                        <Avatar name={currentUser.name} size="lg" />
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Operator Access Context</h4>
                          <p className="text-sm font-bold text-gray-800">{currentUser.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500">Operator Public Display Name</label>
                        <input
                          value={currentUser.name}
                          onChange={e => setCurrentUser(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full rounded-xl border border-gray-250 text-xs px-3 py-2.5 outline-none focus:border-[#52b788] transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500">Public Public Contact Email</label>
                        <input
                          value={currentUser.email}
                          onChange={e => setCurrentUser(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full rounded-xl border border-gray-250 text-xs px-3 py-2.5 outline-none focus:border-[#52b788] transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500">System Bio & Context Notes</label>
                        <textarea
                          value={currentUser.bio}
                          onChange={e => setCurrentUser(prev => ({ ...prev, bio: e.target.value }))}
                          rows={3}
                          className="w-full rounded-xl border border-gray-250 text-xs px-3 py-2.5 outline-none focus:border-[#52b788] transition-colors resize-none"
                        />
                      </div>

                      <div className="pt-2">
                        <Button variant="primary" onClick={() => addToast('success', 'Changes Saved', 'Operator parameters verified and cached.')}>
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* PROVISION TENANT MODAL */}
      <Modal
        open={tenantModalOpen}
        onClose={() => setTenantModalOpen(false)}
        title="Configure & Provision Tenant Cluster"
        footer={
          <>
            <Button variant="outline" onClick={() => setTenantModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddTenant}>Provision Space</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Academy Name</label>
            <input
              placeholder="e.g. Acme Driving School"
              value={newTenantName}
              onChange={e => setNewTenantName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 text-xs px-3 py-2.5 outline-none focus:border-[#52b788] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Subdomain Route Slug</label>
            <div className="relative">
              <input
                placeholder="e.g. acme-driving"
                value={newTenantSlug}
                onChange={e => setNewTenantSlug(e.target.value)}
                className="w-full rounded-xl border border-gray-200 text-xs pl-3 pr-28 py-2.5 outline-none focus:border-[#52b788] transition-colors font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">.dsms.com</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Slug must be lowercase alphanumeric characters only with no spaces.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Subscription Tier Plan</label>
            <select
              value={newTenantPlan}
              onChange={e => setNewTenantPlan(e.target.value)}
              className="w-full rounded-xl border border-gray-200 text-xs px-3 py-2.5 outline-none focus:border-[#52b788] transition-colors bg-white font-semibold"
            >
              <option value="Standard">Standard Tier</option>
              <option value="Enterprise">Enterprise Tier</option>
              <option value="Starter">Starter Tier</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ==========================================
// AUXILIARY LAYOUT ELEMENTS (Donezo Design)
// ==========================================

function Avatar({ name, size = 'md', online }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold bg-[#d8f3dc] text-[#1a472a] overflow-hidden border border-gray-150`}>
        {initials}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500`} />
      )}
    </div>
  );
}
