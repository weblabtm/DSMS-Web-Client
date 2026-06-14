import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Shield,
  UserPlus,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  ArrowUpRight,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  MessageCircle,
  Smartphone,
  Tablet,
  Monitor,
  RefreshCw,
  Copy,
  ExternalLink,
  ChevronDown,
  Check,
  Trash2,
  Pause,
  Play,
  Square,
  Video,
  TrendingUp,
  TrendingDown,
  Upload,
  CheckSquare,
  Calendar,
  BarChart2,
  Users,
  Edit2,
  Filter,
  Download,
  HelpCircle,
  Activity,
  Globe,
  Eye,
  ConciergeBell
} from 'lucide-react'
import { useAuth } from '../../shared/hooks/useAuth'
import { useAuthStore } from '../../shared/store/authStore'
import { buildTenantPath } from '../../shared/config/runtime-config.js'

// ==========================================
// KEYFRAMES & ATOMIC ELEMENTS
// ==========================================

function injectSkeletonKeyframes() {
  if (document.getElementById('sk-keyframes')) return
  const style = document.createElement('style')
  style.id = 'sk-keyframes'
  style.textContent = `
    @keyframes skshimmer {
      0% { background-position: -800px 0; }
      100% { background-position: 800px 0; }
    }
    @keyframes pageFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    /* Hide native webkit calendar/clock indicator in time inputs */
    input[type="time"]::-webkit-calendar-picker-indicator {
      background: none !important;
      display: none !important;
      -webkit-appearance: none !important;
      margin: 0 !important;
      width: 0 !important;
      height: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `
  document.head.appendChild(style)
}

function PageFade({ children, pageKey, className }) {
  return (
    <div
      key={pageKey}
      style={{ animation: 'pageFadeIn 0.25s ease-out both' }}
      className={`w-full ${className || ''}`}
    >
      {children}
    </div>
  )
}

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

function Avatar({ name, size = 'md', online }) {
  const sizes = {
    xs: 'w-6 h-6 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'US'
  const AVATAR_COLORS = [
    'bg-purple-100 text-purple-700',
    'bg-blue-100 text-blue-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700'
  ]
  const colorIdx = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0
  return (
    <div className="relative inline-flex flex-shrink-0">
      <div className={`${sizes[size] || sizes.md} rounded-full flex items-center justify-center font-semibold overflow-hidden ${AVATAR_COLORS[colorIdx]}`}>
        {initials}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
      )}
    </div>
  )
}

function Badge({ variant = 'default', children, dot }) {
  const variants = {
    default: 'bg-gray-100 text-gray-600 border border-gray-200/50',
    completed: 'bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]',
    progress: 'bg-[#fef3c7] text-[#92400e] border border-[#fde68a]',
    pending: 'bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]',
    info: 'bg-blue-50 text-blue-700 border border-blue-100',
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',
    green: 'bg-[#d8f3dc] text-[#1a472a] border border-[#b7e4c7]',
    dark: 'bg-[#1a472a] text-white'
  }
  const dotColors = {
    completed: 'bg-[#052e16]',
    progress: 'bg-amber-500',
    pending: 'bg-red-500',
    info: 'bg-blue-500',
    default: 'bg-gray-400'
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />}
      {children}
    </span>
  )
}

// ==========================================
// BUTTONS & INTERACTIVES
// ==========================================

function Button({ variant = 'primary', size = 'md', icon, children, onClick, disabled, className = '' }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98]'
  const variants = {
    primary: 'bg-[#1a472a] text-white hover:bg-[#2d6a4f] focus:ring-[#1a472a]',
    outline: 'border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-300',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    success: 'bg-[#52b788] text-white hover:bg-[#3da06e] focus:ring-[#52b788]',
    secondary: 'bg-[#d8f3dc] text-[#1a472a] hover:bg-[#c3e6cb] focus:ring-[#52b788]'
  }
  const sizes = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3'
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

function IconButton({ icon, onClick, variant = 'ghost', size = 'md', title, disabled }) {
  const sizes = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' }
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`${sizes[size] || sizes.md} flex items-center justify-center rounded-xl transition-all disabled:opacity-40
        ${variant === 'ghost' ? 'text-gray-500 hover:bg-gray-100' : 'bg-[#1a472a] text-white hover:bg-[#2d6a4f]'} 
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {icon}
    </button>
  )
}

function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(p => !p)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1 border-t border-gray-100" />
            ) : (
              <button key={i}
                onClick={() => { item.onClick?.(); setOpen(false) }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm transition-colors cursor-pointer
                  ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-[#f4f6f4]'}`}
              >
                {item.icon && <span className="text-gray-400">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}

// ==========================================
// TOAST & ALERTS
// ==========================================

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm transition-all duration-300 bg-white
            ${toast.type === 'success' ? 'border-[#52b788]' :
              toast.type === 'error' ? 'border-red-300' :
                toast.type === 'warning' ? 'border-amber-300' : 'border-gray-200'}`}
        >
          <span className={`mt-0.5
            ${toast.type === 'success' ? 'text-[#1a472a]' :
              toast.type === 'error' ? 'text-red-500' :
                toast.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> :
             toast.type === 'error' ? <XCircle size={16} /> :
             toast.type === 'warning' ? <AlertCircle size={16} /> : <Info size={16} />}
          </span>
          <div className="flex-1">
            {toast.title && <p className="text-sm font-semibold text-gray-800">{toast.title}</p>}
            <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

function NotificationList({ items, onMarkRead }) {
  return (
    <ul className="divide-y divide-gray-50">
      {items.map(n => (
        <li key={n.id} className={`flex gap-3 p-4 transition-colors ${n.unread ? 'bg-[#f0fdf4]' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${n.type === 'success' ? 'bg-[#d1fae5] text-[#065f46]' :
              n.type === 'warning' ? 'bg-amber-50 text-amber-600' :
              n.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}
          >
            {n.type === 'success' ? <CheckCircle size={16} /> :
             n.type === 'warning' ? <AlertCircle size={16} /> :
             n.type === 'error' ? <XCircle size={16} /> : <Info size={16} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{n.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
            <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
          </div>
          {n.unread && (
            <button onClick={() => onMarkRead?.(n.id)} className="w-2 h-2 rounded-full bg-[#1a472a] mt-1.5 flex-shrink-0 cursor-pointer" />
          )}
        </li>
      ))}
      {items.length === 0 && (
        <li className="p-4 text-center text-xs text-gray-400">No new notifications</li>
      )}
    </ul>
  )
}

function NotificationPopover({ notifications, onMarkAllRead, onMarkRead }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const unread = notifications.filter(n => n.unread).length

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(p => !p)}
        className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-200/50 shadow-sm text-gray-500 hover:text-gray-700 transition-all hover:bg-gray-50 cursor-pointer"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#1a472a] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="text-xs text-[#1a472a] font-semibold hover:underline cursor-pointer">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            <NotificationList items={notifications} onMarkRead={onMarkRead} />
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// CHARTS & WORKSHOPS
// ==========================================

function LineChart({ data, width = 400, height = 120, color = '#1a472a' }) {
  if (!data.length) return null
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const xStep = width / (data.length - 1)
  const yScale = (v) => height - ((v - min) / (max - min || 1)) * (height * 0.8) - height * 0.1
  const points = data.map((d, i) => `${i * xStep},${yScale(d.value)}`).join(' ')
  const areaPoints = `0,${height} ${points} ${(data.length - 1) * xStep},${height}`
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
  )
}

function PillBarChart({ data, height = 160 }) {
  const max = Math.max(...data.map(d => d.value))
  return (
    <div className="flex items-end gap-2 w-full justify-between" style={{ height }}>
      {data.map((d, i) => {
        const pct = d.value / max
        const barH = Math.max(pct * (height - 32), 12)
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1 max-w-[40px]">
            {d.label2 && <span className="text-[9px] text-gray-400 font-mono font-medium">{d.label2}</span>}
            <div className="relative w-full flex justify-center" style={{ height: height - 24 }}>
              <div className="absolute bottom-0 w-full max-w-[28px] rounded-full"
                style={{
                  height: `${height - 24}px`,
                  background: 'repeating-linear-gradient(-45deg,#e5e7eb 0px,#e5e7eb 2px,#f3f4f6 2px,#f3f4f6 6px)',
                  borderRadius: '999px'
                }}
              />
              <div
                className="absolute bottom-0 w-full max-w-[28px] rounded-full transition-all duration-700"
                style={{
                  height: `${barH}px`,
                  background: d.active ? '#52b788' : '#1a472a',
                  borderRadius: '999px'
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-bold tracking-tight">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ segments, size = 110, thickness = 14 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const r = (size - thickness) / 2
  const cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r

  // Compute segment details purely to avoid mutating local variables inside map()
  const segmentsWithOffset = segments.map((seg, i) => {
    const dash = (seg.value / total) * circumference
    const prevSum = segments.slice(0, i).reduce((s, prevSeg) => s + prevSeg.value, 0)
    const strokeDashoffset = -(prevSum / total) * circumference
    return { ...seg, dash, strokeDashoffset }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {segmentsWithOffset.map((seg, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none" stroke={seg.color} strokeWidth={thickness}
          strokeDasharray={`${seg.dash} ${circumference}`}
          strokeDashoffset={seg.strokeDashoffset} strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

function DonutWithLabel({ value, label, segments }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <DonutChart segments={segments} />
      <div className="absolute text-center">
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold tracking-wider">{label}</p>
      </div>
    </div>
  )
}

function ProgressBar({ value, max = 100, color = '#1a472a', showLabel = false, size = 'md' }) {
  const pct = Math.round((value / max) * 100)
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }
  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 ${heights[size]} rounded-full bg-gray-100 overflow-hidden`}>
        <div className={`${heights[size]} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, background: color }} />
      </div>
      {showLabel && <span className="text-xs text-gray-500 font-bold w-8 text-right font-mono">{pct}%</span>}
    </div>
  )
}

function LiveDot({ label = 'Live' }) {
  return (
    <div className="flex items-center gap-1.5 bg-[#d8f3dc] px-2.5 py-0.5 rounded-full border border-[#b7e4c7]/30">
      <span className="relative flex w-1.5 h-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52b788] opacity-60" />
        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#1a472a]" />
      </span>
      <span className="text-[10px] font-bold text-[#1a472a] uppercase tracking-wider">{label}</span>
    </div>
  )
}

function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  )
}

function StatCard({ label, value, trend, trendLabel, hero, icon: IconComponent, onActionClick }) {
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown
  return (
    <div className={`relative rounded-2xl p-5 shadow-sm border border-gray-100/50 ${hero ? 'bg-[#1a472a] text-white' : 'bg-white text-gray-900'}`}>
      <button
        onClick={onActionClick}
        className={`absolute top-4 right-4 w-7 h-7 rounded-full border flex items-center justify-center
                          transition-colors hover:scale-110 cursor-pointer z-10
                          ${hero ? 'border-white/30 hover:bg-white/10' : 'border-gray-200 hover:bg-gray-50'}`}
      >
        <ArrowUpRight size={13} />
      </button>
      <div className="flex justify-between items-start">
        <p className={`text-xs font-bold uppercase tracking-wider ${hero ? 'text-white/80' : 'text-gray-500'}`}>{label}</p>
        {IconComponent && !hero && <IconComponent className="h-4.5 w-4.5 text-slate-400 mr-7" />}
      </div>
      <p className="text-3xl font-extrabold mt-3 mb-2 leading-none tracking-tight">{value}</p>
      {trendLabel && (
        <div className={`flex items-center gap-1.5 text-xs ${hero ? 'text-white/60' : 'text-gray-400'}`}>
          {trend === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {trend && trend !== 'active' && <TrendIcon size={13} />}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

function Card({ title, headerAction, children, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${padding ? 'p-5' : ''} ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-semibold text-gray-800 text-[15px]">{title}</h3>}
          {headerAction}
        </div>
      )}
      {children}
    </div>
  )
}

function DarkCard({ title, children, className = '' }) {
  return (
    <div className={`rounded-2xl p-5 bg-[#0d2818] text-white shadow-sm border border-[#1a472a]/20 ${className}`}
         style={{ backgroundImage: 'radial-gradient(ellipse at top right, #1a472a 0%, #0d2818 70%)' }}>
      {title && <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">{title}</p>}
      {children}
    </div>
  )
}

function formatLabel(label) {
  if (typeof label !== 'string') return label
  const match = label.match(/^(.*?)\s*\((optional|OPTIONAL)\)$/i)
  if (match) {
    return (
      <>
        {match[1]}
        <span className="text-[10px] font-normal text-gray-400 normal-case ml-1.5">(optional)</span>
      </>
    )
  }
  return label
}

function Input({ label, id, error, hint, icon, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{formatLabel(label)}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        )}
        <input id={id} {...props}
          className={`w-full rounded-xl border text-sm py-2.5 outline-none transition-all placeholder:text-xs
            ${icon ? 'pl-9 pr-3' : 'px-3.5'}
            ${error
              ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400'
              : 'border-gray-200 focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788]'}`} />
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
      {hint && !error && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function Select({ label, id, options, error, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{formatLabel(label)}</label>}
      <div className="relative">
        <select id={id} {...props}
          className={`w-full rounded-xl border text-sm pl-3.5 pr-8 py-2.5 bg-white outline-none transition-all appearance-none cursor-pointer
            ${error ? 'border-red-300' : 'border-gray-200 focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788]'}`}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

function Textarea({ label, id, error, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{formatLabel(label)}</label>}
      <textarea id={id} rows={4} {...props}
        className={`w-full rounded-xl border text-sm px-3.5 py-2.5 outline-none resize-none transition-all placeholder:text-xs
          ${error ? 'border-red-300' : 'border-gray-200 focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788]'}`} />
    </div>
  )
}

function Toggle({ label, checked, onChange, description }) {
  return (
    <div className="flex items-start gap-3">
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors mt-0.5 cursor-pointer
          ${checked ? 'bg-[#1a472a]' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
                          transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
  )
}

function FormSection({ title, description, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-gray-100 last:border-0">
      <div>
        <h4 className="text-sm font-bold text-gray-800">{title}</h4>
        {description && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4 w-full">{children}</div>
    </div>
  )
}

function GeneralSettingsPanel({ onTriggerToast }) {
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [slackNotifs, setSlackNotifs] = useState(false)
  
  const handleSave = () => {
    onTriggerToast('success', 'General settings saved', 'Workspace preferences updated successfully.')
  }

  return (
    <div className="space-y-0 divide-y divide-gray-100">
      <div className="pb-6">
        <h2 className="text-lg font-bold text-gray-900">General Preferences</h2>
        <p className="text-sm text-gray-500 mt-1">Workspace-wide configurations and toggles.</p>
      </div>
      <FormSection title="Appearance" description="Visual settings for the user interface">
        <Toggle label="Dark Mode" checked={darkMode} onChange={setDarkMode}
          description="Switch between light and dark themes (simulation)" />
      </FormSection>
      <FormSection title="Notifications" description="Configure alert channels for driving updates">
        <Toggle label="Email notifications" checked={emailNotifs} onChange={setEmailNotifs}
          description="Receive system updates and certification tracking via email" />
        <Toggle label="Slack notifications" checked={slackNotifs} onChange={setSlackNotifs}
          description="Receive real-time scheduling reminders inside slack channels" />
      </FormSection>
      <div className="pt-6 flex justify-end">
        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}

function ProfileSettingsPanel({ currentUser, onUpdateProfile, onTriggerToast }) {
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [bio, setBio] = useState(currentUser.bio || '')
  const [timezone, setTimezone] = useState('asia/colombo')
  const [language, setLanguage] = useState('en')

  const handleSave = () => {
    onUpdateProfile({ name, email, bio })
    onTriggerToast('success', 'Profile updated', 'Personal records saved successfully.')
  }

  return (
    <div className="space-y-0 divide-y divide-gray-100">
      <div className="pb-6">
        <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage public profile attributes and coordinates.</p>
      </div>

      <FormSection title="Photo" description="Update your public profile photo">
        <div className="flex items-center gap-4">
          <Avatar name={name} size="lg" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" icon={<Upload size={14}/>} onClick={() => onTriggerToast('info', 'Upload File', 'Mock upload file window triggered.')}>Upload</Button>
            <Button size="sm" variant="ghost" icon={<Trash2 size={14}/>} onClick={() => onTriggerToast('warning', 'Avatar deleted', 'Avatar deleted placeholder triggered.')}>Remove</Button>
          </div>
        </div>
      </FormSection>

      <FormSection title="Basic Info" description="Display details shared across cohorts">
        <Input label="Full name" id="prof-name" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Email Address" id="prof-email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
        <Textarea label="Bio" id="prof-bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell your team about yourself..." />
      </FormSection>

      <FormSection title="Regional Preferences" description="Adjust coordinates for scheduling alignment">
        <Select label="Timezone" id="prof-tz" value={timezone} onChange={e => setTimezone(e.target.value)} options={[
          { value: 'utc', label: 'UTC' },
          { value: 'asia/colombo', label: 'Asia/Colombo (UTC+5:30)' },
          { value: 'est', label: 'Eastern Standard Time (UTC-5)' }
        ]} />
        <Select label="Language" id="prof-lang" value={language} onChange={e => setLanguage(e.target.value)} options={[
          { value: 'en', label: 'English' },
          { value: 'lk', label: 'Sinhala' }
        ]} />
      </FormSection>

      <div className="pt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => { setName(currentUser.name); setEmail(currentUser.email); setBio(currentUser.bio || '') }}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}

function SettingsPageLayout({ section, setSection, onTriggerToast, currentUser, onUpdateProfile, sessions, sessionsLoading, fetchSessions, handleRevoke, revokingId, user }) {
  const SETTINGS_SECTIONS = [
    { id: 'profile',       label: 'Profile',         icon: User },
    { id: 'sessions',      label: 'Active Sessions', icon: Activity },
    { id: 'general',       label: 'General Settings',icon: Settings }
  ]

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full items-start overflow-hidden w-full">
      {/* Settings sidebar */}
      <aside className="w-full md:w-56 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">Category</p>
        <nav className="space-y-1">
          {SETTINGS_SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <button
                type="button"
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer
                  ${section === s.id
                    ? 'bg-[#d8f3dc] text-[#1a472a]'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
              >
                <Icon size={16} className="flex-shrink-0" />
                {s.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Content panel */}
      <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 w-full overflow-y-auto h-full min-h-0">
        {section === 'profile'  && (
          <ProfileSettingsPanel 
            currentUser={currentUser} 
            onUpdateProfile={onUpdateProfile} 
            onTriggerToast={onTriggerToast} 
          />
        )}
        {section === 'sessions' && (
          <ActiveSessionsSettingsPanel 
            sessions={sessions}
            sessionsLoading={sessionsLoading}
            fetchSessions={fetchSessions}
            handleRevoke={handleRevoke}
            revokingId={revokingId}
            user={user}
          />
        )}
        {section === 'general'  && (
          <GeneralSettingsPanel 
            onTriggerToast={onTriggerToast} 
          />
        )}
      </div>
    </div>
  )
}

function ActiveSessionsSettingsPanel({ sessions, sessionsLoading, fetchSessions, handleRevoke, revokingId, user }) {
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

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

  const formatLastActive = (timestamp, now) => {
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (diff < 0 || minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Active Sessions</h3>
          <p className="text-xs text-gray-500 mt-1">Manage and monitor devices currently connected to your school tenant workspace.</p>
        </div>
        <button
          type="button"
          onClick={() => fetchSessions(true)}
          disabled={sessionsLoading}
          className="h-8 w-8 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-900 transition-all hover:shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={sessionsLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {sessionsLoading && sessions.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
          <RefreshCw size={24} className="animate-spin text-[#1a472a]" />
          <span className="text-xs font-medium">Retrieving secure session nodes...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <Monitor size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm font-semibold">No active sessions found</p>
          <p className="text-xs text-gray-400 mt-1">Your session is initialized via temporary token credentials.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map(s => {
            const isCurrent = s.sessionId === user?.sessionId
            const DeviceIcon = getDeviceIcon(s.devicePlatform)
            const deviceName = getDeviceName(s.deviceOs, s.devicePlatform)
            const platform = s.devicePlatform || 'Desktop'
            
            return (
              <div
                key={s.sessionId}
                className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative group ${
                  isCurrent 
                    ? 'bg-[#f0fdf4]/50 border-[#b7e4c7] hover:border-[#74c69d]' 
                    : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCurrent ? 'bg-[#d8f3dc] text-[#1a472a]' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <DeviceIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-gray-800 truncate">{deviceName}</span>
                      {isCurrent ? (
                        <span className="text-[9px] font-bold bg-[#1a472a] text-white px-2 py-0.5 rounded-full uppercase tracking-wider scale-95 shrink-0">
                          Active Now
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider scale-95 shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.deviceOs || 'System OS'} · {platform}</p>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Started: {new Date(s.createdAt * 1000).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Globe size={11} />
                        Last Active: {formatLastActive(s.createdAt * 1000, currentTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRevoke(s.sessionId)}
                      disabled={revokingId === s.sessionId}
                      className="text-xs font-bold text-red-650 hover:text-red-750 hover:bg-red-55/60 px-3 py-1.5 rounded-lg border border-red-100 bg-white hover:border-red-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {revokingId === s.sessionId ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          Terminating...
                        </>
                      ) : (
                        <>
                          <LogOut size={12} />
                          Revoke Access
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ==========================================
// MOCK COMPONENTS
// ==========================================

function UptimeTracker() {
  const [seconds, setSeconds] = useState(5420) // 01:30:20
  const [running, setRunning] = useState(true)
  
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const fmt = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const sec = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  return (
    <DarkCard title="Cluster Uptime">
      <p className="text-4xl font-mono font-bold tracking-widest text-center my-6 text-[#52b788]">
        {fmt(seconds)}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => setRunning(p => !p)}
          className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow cursor-pointer">
          {running ? <Pause size={16}/> : <Play size={16}/>}
        </button>
        <button onClick={() => { setSeconds(0); setRunning(false) }}
          className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow cursor-pointer">
          <Square size={16}/>
        </button>
      </div>
    </DarkCard>
  )
}

// ==========================================
// ADDITIONAL HELPER COMPONENTS
// ==========================================

function Pagination({ page, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                   hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
        <ChevronLeft size={15}/>
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer
            ${p === page ? "bg-[#1a472a] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                   hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
        <ChevronRight size={15}/>
      </button>
    </div>
  )
}

function SearchFilterBar({ onSearch, filters, activeFilters, onFilterChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 flex-1 min-w-[200px]">
        <Search size={15} className="text-gray-400" />
        <input placeholder="Search tasks..." onChange={e => onSearch(e.target.value)}
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
      </div>
      {filters?.map(f => (
        <button key={f.id} onClick={() => onFilterChange(f.id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer
            ${activeFilters?.includes(f.id)
              ? "bg-[#1a472a] text-white border-[#1a472a]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#52b788]"}`}>
          {f.icon} {f.label}
        </button>
      ))}
      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 cursor-pointer">
        <Filter size={14}/> Filters
      </button>
      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 cursor-pointer">
        <Download size={14}/> Export
      </button>
    </div>
  )
}

function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  return (
    <ul className="space-y-2">
      {tasks.map(task => (
        <li key={task.id}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-colors">
          <button onClick={() => onToggle?.(task.id)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
              ${task.done ? "bg-[#1a472a] border-[#1a472a]" : "border-gray-300 hover:border-[#52b788]"}`}>
            {task.done && <Check size={11} className="text-white" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>
              {task.title}
            </p>
            {task.due && <p className="text-xs text-gray-400 mt-0.5">{task.due}</p>}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconButton icon={<Edit2 size={13}/>} size="sm" onClick={() => onEdit?.(task)} />
            <IconButton icon={<Trash2 size={13}/>} size="sm" onClick={() => onDelete?.(task.id)} />
          </div>
          <Badge variant={task.priority === "high" ? "pending" : task.priority === "med" ? "progress" : "default"}>
            {task.priority}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

function ActivityList({ items }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 group">
          <Avatar name={item.user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{item.user}</p>
            <p className="text-xs text-gray-400 truncate">
              Working on <span className="text-gray-600 font-medium">{item.task}</span>
            </p>
          </div>
          <Badge variant={item.status}>{item.statusLabel}</Badge>
        </li>
      ))}
    </ul>
  )
}

function ReminderCard({ title, time, onStart }) {
  return (
    <Card>
      <p className="text-xs text-gray-400 mb-1">Upcoming</p>
      <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-5">Time: {time}</p>
      <button onClick={onStart}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer
                   bg-[#1a472a] text-white font-semibold hover:bg-[#2d6a4f] transition-colors">
        <Video size={16}/> Start Meeting
      </button>
    </Card>
  )
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#d8f3dc] flex items-center justify-center text-[#1a472a] mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}

function DataTable({ columns, data, onRowClick, selectable, actions, onViewSelected, onEditSelected, onDeleteSelected, onExportSelected }) {
  const [selected, setSelected] = useState([])
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState("asc")

  const [prevData, setPrevData] = useState(data)
  if (data !== prevData) {
    setPrevData(data)
    setSelected([])
  }

  const toggleRow = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () =>
    setSelected(selected.length === data.length && data.length > 0 ? [] : data.map(r => r.id))

  const sorted = sortCol
    ? [...data].sort((a, b) => {
        const v = a[sortCol] < b[sortCol] ? -1 : 1
        return sortDir === "asc" ? v : -v
      })
    : data

  const handleSort = (key) => {
    if (sortCol === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortCol(key); setSortDir("asc"); }
  }

  return (
    <div className="overflow-x-auto w-full">
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 mb-2 rounded-xl bg-[#d8f3dc] text-[#1a472a]">
          <span className="text-sm font-medium">{selected.length} selected</span>
          {selected.length === 1 && onViewSelected && (
            <Button
              size="xs"
              variant="outline"
              icon={<Eye size={12}/>}
              onClick={() => {
                const item = data.find(r => r.id === selected[0])
                if (item) onViewSelected(item)
              }}
            >
              View More
            </Button>
          )}
          {selected.length === 1 && onEditSelected && (
            <Button
              size="xs"
              variant="outline"
              icon={<Edit2 size={12}/>}
              onClick={() => {
                const item = data.find(r => r.id === selected[0])
                if (item) onEditSelected(item)
              }}
            >
              Edit
            </Button>
          )}
          {onDeleteSelected && (
            <Button
              size="xs"
              variant="danger"
              icon={<Trash2 size={12}/>}
              onClick={() => onDeleteSelected(selected)}
            >
              Delete
            </Button>
          )}
          {onExportSelected && (
            <Button
              size="xs"
              variant="outline"
              icon={<Download size={12}/>}
              onClick={() => onExportSelected(selected)}
            >
              Export
            </Button>
          )}
        </div>
      )}
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {selectable && (
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selected.length === data.length && data.length > 0}
                  onChange={toggleAll} className="rounded accent-[#1a472a]"/>
              </th>
            )}
            {columns.map(col => (
              <th key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide
                  ${col.sortable !== false ? "cursor-pointer hover:text-gray-800 select-none" : ""}`}>
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortCol === col.key && (
                    <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </span>
              </th>
            ))}
            {actions && <th className="px-4 py-3 w-16" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map((row) => (
            <tr key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`group transition-colors ${onRowClick ? "cursor-pointer" : ""}
                hover:bg-[#f4f6f4] ${selected.includes(row.id) ? "bg-[#f0fdf4]" : ""}`}>
              {selectable && (
                <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleRow(row.id); }}>
                  <input type="checkbox" checked={selected.includes(row.id)}
                    onChange={() => {}} className="rounded accent-[#1a472a]"/>
                </td>
              )}
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <EmptyState icon={<Search size={32}/>} title="No results found" />}
    </div>
  )
}

function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.()
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  if (!open) return null
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl", full: "max-w-full mx-4" }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Dialog */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size] || widths.md} flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400
                       hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

function ConfirmDialog({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>Confirm</Button>
      </>}>
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  )
}

// ==========================================
// TENANT ADMIN DASHBOARD COMPONENT
// ==========================================

export default function TenantDashboard() {
  const { user, currentRole, logout } = useAuth()
  const { getActiveSessions, revokeSession } = useAuthStore()
  const navigate = useNavigate()
  const inviteableRoles = useMemo(() => {
    if (currentRole === 'Tenant Admin') {
      return ['Tenant Admin', 'Front Desk']
    }
    if (currentRole === 'Front Desk') {
      return ['Front Desk', 'Instructor', 'Student']
    }
    return []
  }, [currentRole])
  const canInvite = inviteableRoles.length > 0

  // System States
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, sessions, invite
  const [loading, setLoading] = useState(false)

  // Settings & Profile mock states
  const [settingsSection, setSettingsSection] = useState('profile')
  const [currentUser, setCurrentUser] = useState({
    name: user?.userId ? (user.userId.length > 15 ? user.userId.substring(0, 12) + '...' : user.userId) : 'system_user',
    email: user?.userId ? `${user.userId.toLowerCase().substring(0, 8)}@dsms.com` : 'user@dsms.com',
    bio: 'Multi-tenant driving academy administrator & scheduling operator.'
  })

  const userId = user?.userId
  const displayName = useMemo(() => {
    if (!userId) return 'system_user'
    return userId.length > 15 ? `${userId.substring(0, 12)}...` : userId
  }, [userId])

  // Active Sessions States
  const [sessions, setSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [revokingId, setRevokingId] = useState(null)

  // Invite Generator States
  const [targetRole, setTargetRole] = useState(inviteableRoles[0] || '')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')

  // Toasts list state
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((type, title, message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  // Notifications mock data
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Schedule verified', body: 'Instructor Alice Johnson verified weekly shifts.', time: '2 mins ago', unread: true },
    { id: 2, type: 'info', title: 'New student enrolled', body: 'Registered user joined under Central Cluster.', time: '1 hour ago', unread: true },
    { id: 3, type: 'warning', title: 'Socket threshold alert', body: 'Active connections reached 85% of limit.', time: '3 hours ago', unread: false }
  ])

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n))
  }
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    addToast('success', 'Notifications updated', 'All system notifications marked as read.')
  }

  // Tasks Checklist States
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Verify instructor certification files', priority: 'high', due: 'Today, 5:00 PM', done: false },
    { id: 2, title: 'Update driving roster for June 2026', priority: 'med', due: 'Tomorrow, 9:00 AM', done: true },
    { id: 3, title: 'Revoke inactive student session tokens', priority: 'low', due: 'In 2 days', done: false },
    { id: 4, title: 'Setup fleet maintenance checklist alerts', priority: 'high', due: 'June 12, 2026', done: false },
    { id: 5, title: 'Audit registration log endpoints', priority: 'low', due: 'June 15, 2026', done: false }
  ])
  const [taskSearch, setTaskSearch] = useState('')
  const [taskFilters, setTaskFilters] = useState([])
  const [taskPage, setTaskPage] = useState(1)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedTaskIdForDelete, setSelectedTaskIdForDelete] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('low')
  const [newTaskDue, setNewTaskDue] = useState('')

  // Registry Sub-sidebar and Users States
  const [activeRoleTab, setActiveRoleTab] = useState(() => {
    if (currentRole === 'Front Desk') return 'Front Desk'
    return 'Tenant Admin'
  })

  const [prevRole, setPrevRole] = useState(currentRole)
  if (currentRole !== prevRole) {
    setPrevRole(currentRole)
    setActiveRoleTab(currentRole === 'Front Desk' ? 'Front Desk' : 'Tenant Admin')
  }
  const [registeredUsers, setRegisteredUsers] = useState([
    // Tenant Admins
    {
      id: 101,
      role: 'Tenant Admin',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      email: 'john.doe@apex.com',
      phone: '+1 555-0199',
      tenantName: 'Apex Driving Academy',
      businessReg: 'TX-998811',
      address: '123 Main St, Austin, TX',
      status: 'completed',
      statusLabel: 'Active'
    },
    {
      id: 102,
      role: 'Tenant Admin',
      firstName: 'Sarah',
      lastName: 'Connor',
      name: 'Sarah Connor',
      email: 'sconnor@cyberdyne.org',
      phone: '+1 555-0244',
      tenantName: 'Cyberdyne Motors',
      businessReg: 'CA-332211',
      address: '456 Elm St, Los Angeles, CA',
      status: 'completed',
      statusLabel: 'Active'
    },
    // Instructors
    {
      id: 1,
      role: 'Instructor',
      firstName: 'Alice',
      lastName: 'Johnson',
      name: 'Alice Johnson',
      email: 'alice.j@dsms.com',
      phone: '+1 555-0101',
      employeeId: 'INS-001',
      licenseNumber: 'LC-99221',
      specialization: 'Car (Manual/Automatic)',
      status: 'completed',
      statusLabel: 'Active',
      classes: 24,
      rating: 4.9
    },
    {
      id: 2,
      role: 'Instructor',
      firstName: 'Bob',
      lastName: 'Smith',
      name: 'Bob Smith',
      email: 'bob.s@dsms.com',
      phone: '+1 555-0102',
      employeeId: 'INS-002',
      licenseNumber: 'LC-88112',
      specialization: 'Truck (Heavy Duty)',
      status: 'completed',
      statusLabel: 'Active',
      classes: 18,
      rating: 4.7
    },
    {
      id: 4,
      role: 'Instructor',
      firstName: 'Diana',
      lastName: 'Prince',
      name: 'Diana Prince',
      email: 'diana.p@dsms.com',
      phone: '+1 555-0104',
      employeeId: 'INS-004',
      licenseNumber: 'LC-77334',
      specialization: 'Motorcycle',
      status: 'completed',
      statusLabel: 'Active',
      classes: 30,
      rating: 5.0
    },
    // Front Desk
    {
      id: 3,
      role: 'Front Desk',
      firstName: 'Charlie',
      lastName: 'Davis',
      name: 'Charlie Davis',
      email: 'charlie.d@dsms.com',
      phone: '+1 555-0103',
      employeeId: 'FD-001',
      shift: 'Morning (08:00 AM - 04:00 PM)',
      departmentBranch: 'Central Operations',
      status: 'progress',
      statusLabel: 'On Leave',
      classes: 0,
      rating: 4.5
    },
    {
      id: 5,
      role: 'Front Desk',
      firstName: 'Ethan',
      lastName: 'Hunt',
      name: 'Ethan Hunt',
      email: 'ethan.h@dsms.com',
      phone: '+1 555-0105',
      employeeId: 'FD-002',
      shift: 'Custom (04:00 PM - 12:00 AM)',
      departmentBranch: 'Emergency Services',
      status: 'pending',
      statusLabel: 'Inactive',
      classes: 0,
      rating: 4.2
    },
    // Students
    {
      id: 201,
      role: 'Student',
      firstName: 'Peter',
      lastName: 'Parker',
      name: 'Peter Parker',
      email: 'peter.p@dailybugle.com',
      phone: '+1 555-0201',
      studentId: 'STU-101',
      dob: '2005-08-10',
      targetLicense: 'Class D (Standard)',
      status: 'completed',
      statusLabel: 'Active'
    },
    {
      id: 202,
      role: 'Student',
      firstName: 'Bruce',
      lastName: 'Wayne',
      name: 'Bruce Wayne',
      email: 'bruce.w@waynecorp.com',
      phone: '+1 555-0202',
      studentId: 'STU-102',
      dob: '1995-02-19',
      targetLicense: 'Class M (Motorcycle)',
      status: 'progress',
      statusLabel: 'On Leave'
    }
  ])
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)

  // Registration Form field states
  const [formRole, setFormRole] = useState('Tenant Admin')
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formStatus, setFormStatus] = useState('completed')
  const [formTenantName, setFormTenantName] = useState('')
  const [formBusinessReg, setFormBusinessReg] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formEmployeeId, setFormEmployeeId] = useState('')
  const [formLicenseNumber, setFormLicenseNumber] = useState('')
  const [formSpecialization, setFormSpecialization] = useState('')
  const [formStudentId, setFormStudentId] = useState('')
  const [formDob, setFormDob] = useState('')
  const [formTargetLicense, setFormTargetLicense] = useState('')
  const [formDepartmentBranch, setFormDepartmentBranch] = useState('')
  const [shiftStart24, setShiftStart24] = useState('08:00')
  const [shiftEnd24, setShiftEnd24] = useState('16:00')
  const [shiftName, setShiftName] = useState('Morning')
  const shiftStartRef = useRef(null)
  const shiftEndRef = useRef(null)

  const convert24to12 = (time24) => {
    if (!time24) return ''
    const [hStr, mStr] = time24.split(':')
    let h = parseInt(hStr, 10)
    const m = mStr || '00'
    const ampm = h >= 12 ? 'PM' : 'AM'
    h = h % 12
    if (h === 0) h = 12
    const hFormatted = String(h).padStart(2, '0')
    return `${hFormatted}:${m} ${ampm}`
  }

  const convert12to24 = (time12, ampm) => {
    if (!time12) return '08:00'
    const [hStr, mStr] = time12.split(':')
    let h = parseInt(hStr, 10)
    const m = mStr || '00'
    const period = ampm ? ampm.toUpperCase() : 'AM'
    if (period === 'PM' && h < 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${m}`
  }

  const [showShiftPicker, setShowShiftPicker] = useState(false)
  const shiftPickerRef = useRef(null)

  // Close shift picker dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (shiftPickerRef.current && !shiftPickerRef.current.contains(e.target)) {
        setShowShiftPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Delete dialog states
  const [userDeleteConfirmOpen, setUserDeleteConfirmOpen] = useState(false)
  const [selectedUserIdsForDelete, setSelectedUserIdsForDelete] = useState([])

  // View details modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingMember, setViewingMember] = useState(null)

  // Tasks Handlers
  const handleToggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    const task = tasks.find(t => t.id === id)
    if (task) {
      addToast('success', !task.done ? 'Task Completed' : 'Task Incomplete', `"${task.title}" updated.`)
    }
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      addToast('error', 'Validation Error', 'Task title is required.')
      return
    }
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, title: newTaskTitle, priority: newTaskPriority, due: newTaskDue || 'No due date' } : t))
      addToast('success', 'Task Updated', `Task "${newTaskTitle}" updated successfully.`)
    } else {
      const newTaskObj = {
        id: Date.now(),
        title: newTaskTitle,
        priority: newTaskPriority,
        due: newTaskDue || 'No due date',
        done: false
      }
      setTasks(prev => [newTaskObj, ...prev])
      addToast('success', 'Task Added', `Task "${newTaskTitle}" created successfully.`)
    }
    setTaskModalOpen(false)
    setEditingTask(null)
    setNewTaskTitle('')
    setNewTaskPriority('low')
    setNewTaskDue('')
  }

  const handleEditTaskClick = (task) => {
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setNewTaskPriority(task.priority)
    setNewTaskDue(task.due)
    setTaskModalOpen(true)
  }

  const handleDeleteTaskClick = (id) => {
    setSelectedTaskIdForDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDeleteTask = () => {
    if (selectedTaskIdForDelete) {
      setTasks(prev => prev.filter(t => t.id !== selectedTaskIdForDelete))
      addToast('success', 'Task Deleted', 'Task deleted successfully.')
    }
    setDeleteConfirmOpen(false)
    setSelectedTaskIdForDelete(null)
  }

  // User Registry Handlers
  const handleAddMemberClick = () => {
    setEditingMember(null)
    setFormRole(activeRoleTab)
    setFormFirstName('')
    setFormLastName('')
    setFormEmail('')
    setFormPhone('')
    setFormStatus('completed')
    setFormTenantName('')
    setFormBusinessReg('')
    setFormAddress('')
    setFormPassword('')
    setFormEmployeeId('')
    setFormLicenseNumber('')
    setFormSpecialization('')
    setFormStudentId('')
    setFormDob('')
    setFormTargetLicense('')
    setFormDepartmentBranch('')
    setShiftName('Morning')
    setShiftStart24('08:00')
    setShiftEnd24('16:00')
    setShowShiftPicker(false)
    setMemberModalOpen(true)
  }

  const handleEditMemberClick = (member) => {
    setEditingMember(member)
    setFormRole(member.role)
    setFormFirstName(member.firstName || member.name?.split(' ')[0] || '')
    setFormLastName(member.lastName || member.name?.split(' ').slice(1).join(' ') || '')
    setFormEmail(member.email || '')
    setFormPhone(member.phone || '')
    setFormStatus(member.status || 'completed')
    setFormTenantName(member.tenantName || '')
    setFormBusinessReg(member.businessReg || '')
    setFormAddress(member.address || '')
    setFormPassword(member.password || '')
    setFormEmployeeId(member.employeeId || '')
    setFormLicenseNumber(member.licenseNumber || '')
    setFormSpecialization(member.specialization || '')
    setFormStudentId(member.studentId || '')
    setFormDob(member.dob || '')
    setFormTargetLicense(member.targetLicense || '')
    setFormDepartmentBranch(member.departmentBranch || '')
    // Parse shift presets
    if (member.shift) {
      const match = member.shift.match(/^(.*?)\s*\((.*?)\s*(AM|PM)\s*-\s*(.*?)\s*(AM|PM)\)$/i)
      if (match) {
        const parsedName = match[1].trim()
        setShiftName(parsedName === 'Morning' ? 'Morning' : 'Custom')
        setShiftStart24(convert12to24(match[2], match[3]))
        setShiftEnd24(convert12to24(match[4], match[5]))
      } else {
        setShiftName('Custom')
        setShiftStart24('08:00')
        setShiftEnd24('16:00')
      }
    } else {
      setShiftName('Morning')
      setShiftStart24('08:00')
      setShiftEnd24('16:00')
    }
    setShowShiftPicker(false)
    setMemberModalOpen(true)
  }

  const handleSaveMember = () => {
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim() || !formPhone.trim()) {
      addToast('error', 'Validation Error', 'First name, last name, email, and phone number are required.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formEmail)) {
      addToast('error', 'Validation Error', 'Please enter a valid email address.')
      return
    }

    const statusLabelMap = {
      completed: 'Active',
      progress: 'On Leave',
      pending: 'Inactive'
    }

    const name = `${formFirstName.trim()} ${formLastName.trim()}`
    const userData = {
      role: formRole,
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      name,
      email: formEmail.trim(),
      phone: formPhone.trim(),
      status: formStatus,
      statusLabel: statusLabelMap[formStatus] || 'Active',
      tenantName: formRole === 'Tenant Admin' ? formTenantName.trim() : undefined,
      businessReg: formRole === 'Tenant Admin' ? formBusinessReg.trim() : undefined,
      address: formRole === 'Tenant Admin' ? formAddress.trim() : undefined,
      password: formRole === 'Tenant Admin' ? formPassword : undefined,
      employeeId: (formRole === 'Instructor' || formRole === 'Front Desk') ? formEmployeeId.trim() : undefined,
      licenseNumber: formRole === 'Instructor' ? formLicenseNumber.trim() : undefined,
      specialization: formRole === 'Instructor' ? formSpecialization.trim() : undefined,
      shift: formRole === 'Front Desk'
        ? `${shiftName === 'Custom' ? 'Custom' : shiftName} (${convert24to12(shiftStart24)} - ${convert24to12(shiftEnd24)})`
        : undefined,
      departmentBranch: formRole === 'Front Desk' ? formDepartmentBranch.trim() : undefined,
      studentId: formRole === 'Student' ? formStudentId.trim() : undefined,
      dob: formRole === 'Student' ? formDob : undefined,
      targetLicense: formRole === 'Student' ? formTargetLicense.trim() : undefined,
    }

    if (editingMember) {
      setRegisteredUsers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...userData } : m))
      addToast('success', 'User Record Updated', `Successfully updated details for ${name}.`)
    } else {
      const newUser = {
        id: Date.now(),
        classes: formRole === 'Instructor' ? 0 : undefined,
        rating: formRole === 'Instructor' ? 5.0 : undefined,
        ...userData
      }
      setRegisteredUsers(prev => [newUser, ...prev])
      addToast('success', 'User Registered', `Successfully registered new ${formRole}: ${name}.`)
    }
    setMemberModalOpen(false)
    setEditingMember(null)
  }

  const handleViewMemberClick = (member) => {
    setViewingMember(member)
    setViewModalOpen(true)
  }

  const handleDeleteMemberClick = (ids) => {
    const idsArray = Array.isArray(ids) ? ids : [ids]
    setSelectedUserIdsForDelete(idsArray)
    setUserDeleteConfirmOpen(true)
  }

  const handleConfirmDeleteUser = () => {
    if (selectedUserIdsForDelete.length > 0) {
      if (selectedUserIdsForDelete.length === 1) {
        const id = selectedUserIdsForDelete[0]
        const userToDelete = registeredUsers.find(u => u.id === id)
        const name = userToDelete ? userToDelete.name : 'User'
        setRegisteredUsers(prev => prev.filter(u => !selectedUserIdsForDelete.includes(u.id)))
        addToast('success', 'User Deleted', `Successfully removed registration record for ${name}.`)
      } else {
        setRegisteredUsers(prev => prev.filter(u => !selectedUserIdsForDelete.includes(u.id)))
        addToast('success', 'Users Deleted', `Successfully removed registration records for ${selectedUserIdsForDelete.length} selected users.`)
      }
    }
    setUserDeleteConfirmOpen(false)
    setSelectedUserIdsForDelete([])
  }

  const getDeleteConfirmMessage = () => {
    if (selectedUserIdsForDelete.length > 1) {
      return `Are you sure you want to permanently delete these ${selectedUserIdsForDelete.length} users? This will revoke all active session permissions.`
    }
    return "Are you sure you want to permanently delete this user? This will revoke all active session permissions."
  }

  const getTableColumns = (role) => {
    const defaultCols = [
      {
        key: "name",
        label: "Name",
        render: (v, row) => (
          <div className="flex items-center gap-3">
            <Avatar name={v} size="sm" />
            <div>
              <p className="font-semibold text-gray-900 leading-none">{v}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{row.email}</p>
            </div>
          </div>
        )
      },
      {
        key: "phone",
        label: "Phone Number",
        render: (v) => <span className="text-gray-650 font-medium text-xs">{v || 'N/A'}</span>
      }
    ]

    switch (role) {
      case 'Tenant Admin':
        return [
          ...defaultCols,
          {
            key: "tenantName",
            label: "Tenant Name",
            render: (v) => <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-0.5 text-xs">{v || 'N/A'}</span>
          },
          {
            key: "status",
            label: "Status",
            render: (v, row) => <Badge variant={v} dot>{row.statusLabel}</Badge>
          }
        ]
      case 'Instructor':
        return [
          ...defaultCols,
          {
            key: "employeeId",
            label: "Employee ID",
            render: (v) => <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">{v || 'N/A'}</span>
          },
          {
            key: "status",
            label: "Status",
            render: (v, row) => <Badge variant={v} dot>{row.statusLabel}</Badge>
          }
        ]
      case 'Front Desk':
        return [
          ...defaultCols,
          {
            key: "employeeId",
            label: "Employee ID",
            render: (v) => <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">{v || 'N/A'}</span>
          },
          {
            key: "status",
            label: "Status",
            render: (v, row) => <Badge variant={v} dot>{row.statusLabel}</Badge>
          }
        ]
      case 'Student':
        return [
          ...defaultCols,
          {
            key: "studentId",
            label: "Student ID",
            render: (v) => <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">{v || 'N/A'}</span>
          }
        ]
      default:
        return defaultCols
    }
  }

  // Fetch active sessions
  const fetchSessions = async (showLoading = true) => {
    if (showLoading) {
      setSessionsLoading(true)
    }
    try {
      const { sessions: list } = await getActiveSessions()
      setSessions(list || [])
      if (showLoading) {
        addToast('success', 'Sessions loaded', 'Session nodes updated.')
      }
    } catch (err) {
      addToast('error', 'Session fetch failed', err.message || 'Could not fetch sessions.')
    } finally {
      setSessionsLoading(false)
    }
  }

  // Revoke active session
  const handleRevoke = async (sessionId) => {
    setRevokingId(sessionId)
    try {
      await revokeSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
      addToast('success', 'Session terminated', 'Target session revoked successfully.')
    } catch (err) {
      addToast('error', 'Revocation failed', err.message || 'Could not terminate session.')
    } finally {
      setRevokingId(null)
    }
  }

  // Generate invite token link
  const handleGenerateLink = () => {
    if (!targetRole) return
    const token = user?.accessToken
    if (!token) return
    const inviteUrl = buildTenantPath(user?.tenantId, `/register?token=${token}`)
    setGeneratedLink(inviteUrl)
    setCopied(false)
    addToast('success', 'Invite Token Generated', `Invite link for "${targetRole}" has been created.`)
  }

  const handleCopy = () => {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    addToast('success', 'URL copied', 'Invite link copied to clipboard.')
    setTimeout(() => setCopied(false), 3000)
  }

  // Reroute Super Admins if needed
  useEffect(() => {
    if (currentRole === 'Super Admin') {
      navigate('/super-admin/dashboard', { replace: true })
    }
  }, [currentRole, navigate])

  // Fetch initial active sessions
  useEffect(() => {
    injectSkeletonKeyframes()
    Promise.resolve().then(() => {
      fetchSessions(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const triggerSimulatedLoad = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      fetchSessions(false)
      addToast('success', 'Sync Complete', 'Workspace cluster synchronized.')
    }, 1200)
  }

  // Sidebar Layout Navigation Items
  const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: CheckSquare, label: 'Tasks', badge: String(tasks.filter(t => !t.done).length), id: 'tasks' },
    { icon: Calendar, label: 'Calendar', id: 'calendar' },
    { icon: BarChart2, label: 'Analytics', id: 'analytics' },
    ...(currentRole !== 'Instructor' && currentRole !== 'Student'
      ? [{ icon: Users, label: 'User Register', id: 'user-register' }]
      : [])
  ]

  const GENERAL_ITEMS = [
    { icon: Settings, label: 'Settings', id: 'settings' },
    { icon: HelpCircle, label: 'Help', id: 'help' },
    { icon: LogOut, label: 'Logout', id: 'logout' }
  ]

  // Mock static stats
  const pillChartData = [
    { label: 'Mon', value: 18, label2: '18 ops' },
    { label: 'Tue', value: 34, label2: '34 ops' },
    { label: 'Wed', value: 25, label2: '25 ops' },
    { label: 'Thu', value: 48, label2: '48 ops', active: true },
    { label: 'Fri', value: 20, label2: '20 ops' },
    { label: 'Sat', value: 12, label2: '12 ops' },
    { label: 'Sun', value: 15, label2: '15 ops' }
  ]

  const lineChartData = [
    { value: 12 }, { value: 18 }, { value: 15 }, { value: 32 },
    { value: 22 }, { value: 40 }, { value: 35 }, { value: 50 }
  ]

  const rosterEvents = {
    4: { title: 'Alice & John', time: '10:00 AM', type: 'high' },
    9: { title: 'Bob & Mary', time: '2:30 PM', type: 'med' },
    12: { title: 'Diana & Peter', time: '11:00 AM', type: 'high' },
    18: { title: 'Alice & Robert', time: '4:00 PM', type: 'low' },
    25: { title: 'Bob & Sarah', time: '9:00 AM', type: 'med' }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchQuery = t.title.toLowerCase().includes(taskSearch.toLowerCase())
      const matchFilter = taskFilters.length === 0 || taskFilters.includes(t.priority)
      return matchQuery && matchFilter
    })
  }, [tasks, taskSearch, taskFilters])

  const tasksPerPage = 5
  const totalTasksPages = Math.max(Math.ceil(filteredTasks.length / tasksPerPage), 1)
  const paginatedTasks = useMemo(() => {
    const start = (taskPage - 1) * tasksPerPage
    return filteredTasks.slice(start, start + tasksPerPage)
  }, [filteredTasks, taskPage])

  const filteredRoleUsers = useMemo(() => {
    return registeredUsers.filter(u => {
      if (u.role !== activeRoleTab) return false
      const matchQuery = u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                         u.email.toLowerCase().includes(memberSearch.toLowerCase())
      return matchQuery
    })
  }, [registeredUsers, activeRoleTab, memberSearch])

  const registryCategories = useMemo(() => {
    if (currentRole === 'Front Desk') {
      return [
        { id: 'Front Desk', label: 'Front Desk', icon: ConciergeBell },
        { id: 'Instructor', label: 'Instructor', icon: User },
        { id: 'Student', label: 'Student', icon: Users }
      ]
    }
    return [
      { id: 'Tenant Admin', label: 'Tenant Admin', icon: Shield },
      { id: 'Front Desk', label: 'Front Desk', icon: ConciergeBell }
    ]
  }, [currentRole])

  // Quota allocation segments
  const activeSessionsCount = sessions.length || 1
  const maxSessionsAllowed = 10
  const activePercentage = Math.round((activeSessionsCount / maxSessionsAllowed) * 100)
  const donutSegments = [
    { value: activeSessionsCount, color: '#1a472a', label: 'Used' },
    { value: maxSessionsAllowed - activeSessionsCount, color: '#fee2e2', label: 'Remaining' }
  ]

  return (
    <div className="flex h-screen bg-[#f4f6f4] overflow-hidden text-gray-800 p-5 gap-5">
      {/* Toast Overlay notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* COLLAPSIBLE SIDEBAR */}
      <aside className={`relative flex flex-col bg-white rounded-[24px] shadow-sm border border-gray-200/50 transition-all duration-300 ease-in-out z-30 h-full ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        <button
          onClick={() => setSidebarCollapsed(p => !p)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Brand logo */}
        <div className={`flex items-center gap-3 px-6 py-5 ${sidebarCollapsed ? 'justify-center px-4' : ''}`}>
          <DonezoLogo />
          {!sidebarCollapsed && (
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Donezo
            </span>
          )}
        </div>

        {/* Navigation block */}
        <nav className="flex-1 px-0 space-y-1 overflow-y-auto">
          {!sidebarCollapsed && (
            <p className="px-6 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              MENU
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
                  ${active
                    ? 'text-gray-900 font-bold'
                    : 'text-gray-400 hover:text-gray-900'}`}
              >
                {active && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#1a472a] rounded-r-md" />
                )}
                <Icon size={18} className={`flex-shrink-0 ${active ? 'text-[#1a472a]' : ''}`} />
                {!sidebarCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                {!sidebarCollapsed && item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ml-auto bg-[#52b788] text-white`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}

          {!sidebarCollapsed && (
            <p className="px-6 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              GENERAL
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
                  ${active
                    ? 'text-gray-900 font-bold'
                    : 'text-gray-400 hover:text-gray-900'}`}
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

        {/* Download Mobile App Card */}
        {!sidebarCollapsed && (
          <div className="mx-4 mb-4 mt-auto p-4 rounded-[20px] bg-gradient-to-br from-[#081c15] to-[#1b4332] text-white relative overflow-hidden shadow-lg border border-white/5">
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-[#52b788]/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -left-6 -top-6 w-20 h-20 bg-[#52b788]/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white mb-3">
              <Smartphone size={16} />
            </div>
            
            <h4 className="font-bold text-sm text-white leading-snug mb-1">
              Download our Mobile App
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed mb-4">
              Get a support certified app
            </p>
            
            <button
              onClick={() => addToast('info', 'Download initiated', 'Downloading DSMS Mobile Client...')}
              className="w-full py-2 rounded-xl bg-[#52b788] hover:bg-[#409c70] text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-sm text-center"
            >
              Download
            </button>
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
                placeholder="Search cluster variables..."
                className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
                disabled
              />
              <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-[10px] text-gray-400 font-mono select-none">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notifications Popover */}
            <NotificationPopover
              notifications={notifications}
              onMarkAllRead={markAllNotificationsRead}
              onMarkRead={markNotificationRead}
            />

            <button className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-gray-200/50 shadow-sm text-gray-500 hover:text-gray-700 transition-all hover:bg-gray-50 cursor-pointer">
              <MessageCircle size={18} />
            </button>

            {/* Profile User Dropdown */}
            <Dropdown
              trigger={
                <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-gray-200/50 shadow-sm hover:bg-gray-50 transition-all text-left cursor-pointer">
                  <Avatar name={displayName} size="sm" online />
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold text-gray-800 leading-none">{displayName}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{user?.tenantId || 'Central Cluster'}</p>
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
              }
              items={[
                { label: 'View Profile', icon: <User size={14} />, onClick: () => setActiveTab('profile') },
                { label: 'Settings', icon: <Settings size={14} />, onClick: () => setActiveTab('settings') },
                { divider: true },
                { label: 'Log out', icon: <LogOut size={14} />, onClick: () => logout(), danger: true }
              ]}
            />
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <main className={`flex-1 p-6 ${
          (activeTab === 'settings' || activeTab === 'profile')
            ? 'overflow-hidden flex flex-col h-full space-y-4'
            : 'overflow-y-auto space-y-6'
        }`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1a472a] border-t-transparent" />
              <span className="text-sm font-semibold text-gray-600">Rotating control node keys...</span>
            </div>
          ) : (
            <PageFade pageKey={activeTab} className={(activeTab === 'settings' || activeTab === 'profile') ? 'h-full flex flex-col overflow-hidden min-h-0' : ''}>
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Dashboard Header */}
                  <PageHeader
                    title="Control Center"
                    subtitle="Monitor organizational deployments, control sessions, and issue secure invitation tokens."
                    actions={
                      <>
                        <Button variant="outline" icon={<RefreshCw size={14} />} onClick={triggerSimulatedLoad}>Sync Node</Button>
                        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setActiveTab('invite')}>Generate Invite</Button>
                      </>
                    }
                  />

                  {/* 4-Up Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Session Status"
                      value="ACTIVE"
                      trend="active"
                      trendLabel="Active Node Connect"
                      hero
                      icon={Shield}
                    />
                    <StatCard
                      label="Tenancy Node"
                      value={user?.tenantId || 'Central Cluster'}
                      trendLabel="Multi-tenant context"
                      icon={Monitor}
                    />
                    <StatCard
                      label="Location Node"
                      value={user?.branchId || 'central_office'}
                      trendLabel="Branch context identifier"
                      icon={Tablet}
                    />
                    <StatCard
                      label="System Role"
                      value={currentRole ? currentRole.toUpperCase() : 'N/A'}
                      trendLabel="Granted access scope"
                      icon={User}
                    />
                  </div>

                  {/* High Fidelity Charts & Live Tracker */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Analytics Line/Bar charts */}
                    <Card title="Operational Performance" className="lg:col-span-2" headerAction={<LiveDot />}>
                      <div className="mb-6 h-36 w-full">
                        <LineChart data={lineChartData} />
                      </div>
                      <PillBarChart data={pillChartData} />
                    </Card>

                    {/* stopwatch uptime tracker */}
                    <UptimeTracker />
                  </div>

                  {/* Invite link & sessions row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Invitation Card */}
                    <div className="lg:col-span-2">
                      <Card title="Organizational Invite Generator">
                        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                          Create secure tokenized urls mapped to your tenant node. Invitees will be forced inside the tenancy boundary constraints.
                        </p>
                        {canInvite ? (
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-end">
                              <div className="flex-1 w-full">
                                <Select
                                  label="Invitee Role"
                                  value={targetRole}
                                  onChange={e => setTargetRole(e.target.value)}
                                  options={inviteableRoles.map(role => ({ value: role, label: role }))}
                                />
                              </div>
                              <Button variant="primary" onClick={handleGenerateLink} disabled={!targetRole} className="w-full sm:w-auto shrink-0 h-[42px] mb-[1px]">
                                Generate Token Link
                              </Button>
                            </div>

                            {generatedLink && (
                              <div className="space-y-2 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Generated invite URL ({targetRole})</p>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-gray-600 font-mono truncate select-all">
                                    {generatedLink}
                                  </div>
                                  <IconButton icon={copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />} onClick={handleCopy} variant="ghost" title="Copy URL" />
                                  <a
                                    href={generatedLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#d8f3dc] text-[#1a472a] hover:bg-[#c3e6cb] transition-colors shrink-0"
                                    title="Open Test Tab"
                                  >
                                    <ExternalLink size={15} />
                                  </a>
                                </div>
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-[#065f46] mt-2">
                                  <Info size={16} className="shrink-0 mt-0.5" />
                                  <p className="leading-relaxed">
                                    Click the external test icon above to verify the onboarding flow. Registration is pre-configured for <span className="font-bold">{targetRole}</span> on tenant node <span className="font-bold">{user?.tenantId}</span>.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <User className="h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-xs font-bold text-gray-600">Access Restricted</p>
                            <p className="text-[11px] text-gray-400 mt-1 max-w-xs">Your system role doesn't have invite generation privileges.</p>
                          </div>
                        )}
                      </Card>
                    </div>

                    {/* Right: Active Sessions */}
                    <div className="lg:col-span-1">
                      <Card
                        title="Active Sessions"
                        headerAction={
                          <button
                            onClick={() => fetchSessions(true)}
                            disabled={sessionsLoading}
                            className="h-7 w-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-700 disabled:opacity-40 cursor-pointer"
                          >
                            <RefreshCw size={13} className={sessionsLoading ? 'animate-spin' : ''} />
                          </button>
                        }
                      >
                        {sessionsLoading && sessions.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-6">Connecting session nodes...</div>
                        ) : sessions.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-6">No nodes registered.</div>
                        ) : (
                          <ul className="space-y-3">
                            {sessions.slice(0, 3).map(s => {
                              const platform = s.devicePlatform || 'Desktop'
                              const PlatformIcon = platform === 'Mobile' ? Smartphone : platform === 'Tablet' ? Tablet : Monitor
                              const isCurrent = s.sessionId === user?.sessionId
                              return (
                                <li
                                  key={s.sessionId}
                                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all
                                    ${isCurrent ? 'bg-[#f0fdf4] border-[#b7e4c7]' : 'bg-white border-gray-100'}`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCurrent ? 'bg-[#d8f3dc] text-[#1a472a]' : 'bg-gray-50 text-gray-400'}`}>
                                      <PlatformIcon size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                        <span className="truncate">{s.deviceOs || 'System OS'}</span>
                                        {isCurrent && (
                                          <span className="text-[9px] font-bold bg-[#1a472a] text-white px-1.5 rounded uppercase tracking-wider scale-95 shrink-0">
                                            Self
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">{platform} · {new Date(s.createdAt * 1000).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  {!isCurrent && (
                                    <button
                                      onClick={() => handleRevoke(s.sessionId)}
                                      disabled={revokingId === s.sessionId}
                                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shrink-0 cursor-pointer"
                                      title="Revoke session node"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </Card>
                    </div>
                  </div>

                  {/* Logs & Quota Capacity */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Simulation Terminal Logs */}
                    <div className="lg:col-span-2">
                      <Card title="Simulation Terminal Logs" headerAction={<div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#52b788] animate-pulse" /><span className="text-[10px] font-bold text-gray-400 uppercase">Live Socket</span></div>}>
                        <div className="bg-[#0b130e] rounded-xl p-4 font-mono text-[10px] text-[#86efac]/85 space-y-1.5 leading-normal border border-[#1a472a]/30 shadow-inner select-none max-h-48 overflow-y-auto">
                          <div><span className="text-[#52b788] font-bold">[info]</span> Initialized control cluster rehydration sequence...</div>
                          <div><span className="text-[#52b788] font-bold">[info]</span> Access Token Decoded claims: sub={user?.userId?.substring(0, 8)}, tenant={user?.tenantId}, role={currentRole}</div>
                          <div><span className="text-[#52b788] font-bold">[info]</span> Session rotational token refresh deployed on socket...</div>
                          <div><span className="text-white font-extrabold">[success]</span> Connection status OK. Node listener bound to local region.</div>
                        </div>
                      </Card>
                    </div>

                    {/* Donut progress allocation card */}
                    <Card title="Quota Limit Allocation" className="flex flex-col items-center justify-center text-center">
                      <div className="my-2">
                        <DonutWithLabel value={`${activePercentage}%`} label="Sessions" segments={donutSegments} />
                      </div>
                      <div className="w-full space-y-2 mt-4">
                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                          <span>Active Allocations</span>
                          <span>{activeSessionsCount}/{maxSessionsAllowed} nodes</span>
                        </div>
                        <ProgressBar value={activePercentage} showLabel={false} />
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="space-y-6">
                  <PageHeader
                    title="Active Sessions Management"
                    subtitle="Monitor and terminate operational session nodes assigned to your account."
                    actions={
                      <Button variant="outline" icon={<RefreshCw size={14} />} onClick={() => fetchSessions(true)}>Refresh Nodes</Button>
                    }
                  />
                  <Card>
                    {sessionsLoading ? (
                      <div className="text-xs text-gray-400 text-center py-6">Loading nodes list...</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <th className="px-4 py-3">Platform</th>
                              <th className="px-4 py-3">Operating System</th>
                              <th className="px-4 py-3">Created Date</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-gray-700">
                            {sessions.map(s => {
                              const platform = s.devicePlatform || 'Desktop'
                              const PlatformIcon = platform === 'Mobile' ? Smartphone : platform === 'Tablet' ? Tablet : Monitor
                              const isCurrent = s.sessionId === user?.sessionId
                              return (
                                <tr key={s.sessionId} className={isCurrent ? 'bg-[#f0fdf4]/40' : ''}>
                                  <td className="px-4 py-4 font-semibold flex items-center gap-2">
                                    <PlatformIcon size={16} className="text-slate-400" />
                                    {platform}
                                  </td>
                                  <td className="px-4 py-4 font-semibold text-gray-900">{s.deviceOs || 'Unknown'}</td>
                                  <td className="px-4 py-4 text-xs text-gray-500">{new Date(s.createdAt * 1000).toLocaleString()}</td>
                                  <td className="px-4 py-4">
                                    {isCurrent ? (
                                      <Badge variant="green">Current Session</Badge>
                                    ) : (
                                      <Badge variant="completed">Active</Badge>
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
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                      >
                                        Revoke
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

              {activeTab === 'invite' && (
                <div className="space-y-6">
                  <PageHeader
                    title="Invite Link Configuration"
                    subtitle="Deploy organizational registration URLs linked to your region."
                  />
                  <div className="max-w-3xl">
                    <Card title="Issue Invitation Token">
                      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                        Specify the target user role. The generated URL contains cryptographic signatures restricting users to the configured system role inside your location cluster.
                      </p>
                      {canInvite ? (
                        <div className="space-y-6">
                          <Select
                            label="Select Candidate Role"
                            value={targetRole}
                            onChange={e => setTargetRole(e.target.value)}
                            options={inviteableRoles.map(role => ({ value: role, label: role }))}
                          />

                          <Button variant="primary" onClick={handleGenerateLink} disabled={!targetRole} className="w-full h-12">
                            Generate Invite URL
                          </Button>

                          {generatedLink && (
                            <div className="space-y-4 pt-6 border-t border-gray-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Onboarding URL</label>
                                <div className="flex gap-2">
                                  <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs text-gray-600 font-mono select-all truncate leading-relaxed">
                                    {generatedLink}
                                  </div>
                                  <IconButton icon={copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />} onClick={handleCopy} variant="ghost" title="Copy URL" />
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <a
                                  href={generatedLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[#d8f3dc] text-[#1a472a] hover:bg-[#c3e6cb] font-semibold text-sm transition-all"
                                >
                                  <ExternalLink size={16} /> Test Registration Flow
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                          <h4 className="text-sm font-bold text-gray-800">Privileges Required</h4>
                          <p className="text-xs text-gray-400 mt-1">Your role is not authorized to generate tenant invite tokens.</p>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  <PageHeader
                    title="Tasks Management Checklist"
                    subtitle="Verify, track, and complete operations tasks mapped to your tenancy credentials."
                    actions={
                      <Button variant="primary" icon={<Plus size={14} />} onClick={() => { setEditingTask(null); setNewTaskTitle(''); setNewTaskPriority('low'); setNewTaskDue(''); setTaskModalOpen(true) }}>Add Task</Button>
                    }
                  />

                  <Card>
                    <div className="space-y-4">
                      <SearchFilterBar
                        onSearch={setTaskSearch}
                        filters={[
                          { id: 'high', label: 'High Priority', icon: '🔴' },
                          { id: 'med', label: 'Med Priority', icon: '🟡' },
                          { id: 'low', label: 'Low Priority', icon: '🟢' }
                        ]}
                        activeFilters={taskFilters}
                        onFilterChange={(id) => {
                          setTaskFilters(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
                          setTaskPage(1)
                        }}
                      />

                      {paginatedTasks.length > 0 ? (
                        <div className="space-y-4">
                          <TaskList
                            tasks={paginatedTasks}
                            onToggle={handleToggleTask}
                            onEdit={handleEditTaskClick}
                            onDelete={handleDeleteTaskClick}
                          />
                          {totalTasksPages > 1 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-400">
                                Showing {((taskPage - 1) * tasksPerPage) + 1} to {Math.min(taskPage * tasksPerPage, filteredTasks.length)} of {filteredTasks.length} tasks
                              </p>
                              <Pagination
                                page={taskPage}
                                totalPages={totalTasksPages}
                                onPageChange={setTaskPage}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <EmptyState
                          icon={<CheckSquare size={32} />}
                          title="No tasks match filter"
                          description="Try broadening your search query or adjusting priority selections."
                          action={<Button variant="outline" size="sm" onClick={() => { setTaskSearch(''); setTaskFilters([]); setTaskPage(1) }}>Reset Filters</Button>}
                        />
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'calendar' && (
                <div className="space-y-6">
                  <PageHeader
                    title="Driving Academy Roster Grid"
                    subtitle="June 2026 schedule and driving sessions roster tracker."
                    actions={
                      <Button variant="primary" icon={<Plus size={14} />} onClick={() => addToast('info', 'Event scheduling', 'Create new roster event panel triggered.')}>Schedule Session</Button>
                    }
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* June 2026 Calendar Grid */}
                    <Card title="June 2026" className="lg:col-span-2">
                      <div className="space-y-4">
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                          <div>Sun</div>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {Array.from({ length: 30 }, (_, i) => {
                            const day = i + 1
                            const event = rosterEvents[day]
                            return (
                              <div key={day} className="h-24 bg-gray-50 border border-gray-100 rounded-xl p-2 flex flex-col justify-between hover:bg-gray-100/50 transition-colors">
                                <span className="text-xs font-bold text-gray-400">{day}</span>
                                {event && (
                                  <button
                                    onClick={() => addToast('info', event.title, `Time: ${event.time} | Priority: ${event.type}`)}
                                    className={`text-[9px] font-bold py-1 px-1.5 rounded-lg text-left truncate cursor-pointer transition-all hover:scale-[1.02]
                                      ${event.type === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                                        event.type === 'med' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                        'bg-blue-50 text-blue-700 border border-blue-100'}`}
                                  >
                                    <div className="font-semibold truncate leading-tight">{event.title}</div>
                                    <div className="opacity-70 mt-0.5">{event.time}</div>
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </Card>

                    {/* Sidebar roster reminders & activities */}
                    <div className="space-y-6">
                      <ReminderCard
                        title="Alice (Int) & John (Stud)"
                        time="June 4, 10:00 AM"
                        onStart={() => addToast('success', 'Driving Session Initiated', 'Virtual driving briefing socket active.')}
                      />
                      <Card title="Roster Activity Log">
                        <ActivityList
                          items={[
                            { user: 'Alice Johnson', task: 'Scheduled June 4 session', status: 'completed', statusLabel: 'Scheduled' },
                            { user: 'Bob Smith', task: 'Drafted June 9 session', status: 'progress', statusLabel: 'Pending' },
                            { user: 'Diana Prince', task: 'Completed June 12 audit', status: 'completed', statusLabel: 'Closed' }
                          ]}
                        />
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <PageHeader
                    title="Operational Analytics & Metrics"
                    subtitle="Visual insights into fleet utilization, instructor workload, and registration conversion."
                    actions={
                      <Button variant="outline" icon={<Download size={14} />} onClick={() => addToast('success', 'Export Analytics', 'Analytics report downloaded.')}>Export CSV</Button>
                    }
                  />

                  {/* Operational stats row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total hours driven" value="450 hrs" trendLabel="June 2026 cumulative" icon={Clock} />
                    <StatCard label="Average Progress" value="78%" trend="up" trendLabel="4.2% from last month" icon={TrendingUp} />
                    <StatCard label="Active Fleet vehicles" value="12 cars" trendLabel="92% utilization rate" icon={Monitor} />
                    <StatCard label="Customer Satisfaction" value="4.9 / 5" trend="up" trendLabel="Based on 120 reviews" icon={User} />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance chart */}
                    <Card title="Daily Traffic Load Metrics" className="lg:col-span-2" headerAction={<LiveDot label="Processing" />}>
                      <div className="mb-6 h-36 w-full">
                        <LineChart data={[
                          { value: 12 }, { value: 18 }, { value: 15 }, { value: 32 },
                          { value: 22 }, { value: 40 }, { value: 35 }, { value: 50 },
                          { value: 45 }, { value: 60 }, { value: 55 }, { value: 70 }
                        ]} />
                      </div>
                      <PillBarChart data={pillChartData} />
                    </Card>

                    {/* Quota donut */}
                    <Card title="Regional Allocation Capacity" className="flex flex-col items-center justify-center text-center">
                      <div className="my-2">
                        <DonutWithLabel value={`${activePercentage}%`} label="Capacity" segments={donutSegments} />
                      </div>
                      <div className="w-full space-y-2 mt-4 text-left">
                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                          <span>Used Session Nodes</span>
                          <span>{activeSessionsCount} of 10</span>
                        </div>
                        <ProgressBar value={activePercentage} showLabel={false} />
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'user-register' && (
                <div className="space-y-6">
                  <PageHeader
                    title="User Register"
                    subtitle="Manage all system tenant administrators, driving instructors, front desk operators, and students."
                    actions={
                      <Button variant="primary" icon={<UserPlus size={14} />} onClick={handleAddMemberClick}>Add User</Button>
                    }
                  />

                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Sub-sidebar for role categories */}
                    <aside className="w-full lg:w-56 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">Registry Categories</p>
                      <nav className="space-y-1">
                        {registryCategories.map(role => {
                          const RoleIcon = role.icon
                          const isActive = activeRoleTab === role.id
                          return (
                            <button
                              type="button"
                              key={role.id}
                              onClick={() => {
                                setActiveRoleTab(role.id)
                                setMemberSearch('')
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer
                                ${isActive
                                  ? 'bg-[#d8f3dc] text-[#1a472a]'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                            >
                              <RoleIcon size={16} className="flex-shrink-0" />
                              {role.label}
                            </button>
                          )
                        })}
                      </nav>
                    </aside>

                    {/* Main Table View */}
                    <div className="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 w-full sm:max-w-md">
                          <Search size={15} className="text-gray-400" />
                          <input
                            placeholder={`Search ${activeRoleTab}s by name or email...`}
                            className="flex-grow bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
                            value={memberSearch}
                            onChange={e => setMemberSearch(e.target.value)}
                          />
                        </div>
                        <div className="text-xs text-gray-400 shrink-0 font-medium">
                          Showing <span className="font-semibold text-gray-700">{filteredRoleUsers.length}</span> {activeRoleTab}s
                        </div>
                      </div>

                      <DataTable
                        columns={getTableColumns(activeRoleTab)}
                        data={filteredRoleUsers}
                        selectable
                        onViewSelected={handleViewMemberClick}
                        onEditSelected={handleEditMemberClick}
                        onDeleteSelected={handleDeleteMemberClick}
                        onExportSelected={(selectedIds) => {
                          addToast('success', 'Export Success', `Successfully exported registration records for ${selectedIds.length} user(s).`)
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'help' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <PageHeader
                    title="Help Center & FAQs"
                    subtitle="Frequently asked questions, system user guides, and contact support details."
                  />
                  <div className="max-w-3xl space-y-4">
                    <Card title="Frequently Asked Questions">
                      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">How do I verify driving schedules?</h4>
                          <p>Go to the Calendar tab in the control centre. Select the roster session card to verify or schedule instructor-student pairings.</p>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <h4 className="font-bold text-gray-900 mb-1">How can I issue a registration invite token?</h4>
                          <p>Click the "Generate Invite" button at the top of the dashboard or use the "Invite Generator" card on the home tab to select a candidate role and copy the cryptographically bound URL.</p>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                          <h4 className="font-bold text-gray-900 mb-1">How do session revokes work?</h4>
                          <p>Active session nodes are tracked under the Active Sessions panel. Click the trash icon next to a session to terminate it immediately. Your self-session cannot be terminated.</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {(activeTab === 'settings' || activeTab === 'profile') && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col overflow-hidden min-h-0 space-y-4">
                  <PageHeader
                    title="Control Configuration"
                    subtitle="Manage personal records, UI preferences, and authentication rules."
                  />
                  <div className="flex-grow flex-1 min-h-0 overflow-hidden">
                    <SettingsPageLayout
                      section={settingsSection}
                      setSection={setSettingsSection}
                      onTriggerToast={addToast}
                      currentUser={currentUser}
                      onUpdateProfile={(updatedData) => setCurrentUser(prev => ({ ...prev, ...updatedData }))}
                      sessions={sessions}
                      sessionsLoading={sessionsLoading}
                      fetchSessions={fetchSessions}
                      handleRevoke={handleRevoke}
                      revokingId={revokingId}
                      user={user}
                    />
                  </div>
                </div>
              )}
            </PageFade>
          )}
        </main>
      </div>

      {/* Create/Edit Task Modal */}
      <Modal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={editingTask ? "Edit Checklist Task" : "Create Checklist Task"}
        footer={
          <>
            <Button variant="outline" onClick={() => setTaskModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddTask}>Save Task</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Task Description"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="e.g. Audit registration log endpoints"
            required
          />
          <Select
            label="Priority Level"
            value={newTaskPriority}
            onChange={e => setNewTaskPriority(e.target.value)}
            options={[
              { value: 'high', label: '🔴 High Priority' },
              { value: 'med', label: '🟡 Medium Priority' },
              { value: 'low', label: '🟢 Low Priority' }
            ]}
          />
          <Input
            label="Due Date / Indicator"
            value={newTaskDue}
            onChange={e => setNewTaskDue(e.target.value)}
            placeholder="e.g. June 15, 2026 or Today, 5:00 PM"
          />
        </div>
      </Modal>

      {/* Delete Task Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDeleteTask}
        title="Delete Checklist Task"
        message="Are you sure you want to permanently remove this task? This operation cannot be undone."
        danger
      />

      {/* Delete User Confirmation */}
      <ConfirmDialog
        open={userDeleteConfirmOpen}
        onClose={() => setUserDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDeleteUser}
        title={selectedUserIdsForDelete.length > 1 ? "Delete Selected Users" : "Delete Registered User"}
        message={getDeleteConfirmMessage()}
        danger
      />

      {/* Register/Edit User Modal */}
      <Modal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title={editingMember ? `Edit User Details: ${editingMember.name}` : `Register New ${formRole}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setMemberModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveMember}>{editingMember ? 'Save Changes' : 'Register User'}</Button>
          </>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Header Role and Availability */}
          <div className={formRole === 'Student' ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">System Role</span>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-[#1a472a] bg-[#d8f3dc]/30">
                {formRole}
              </div>
            </div>
            {formRole !== 'Student' && (
              <Select
                label="Availability Status"
                value={formStatus}
                onChange={e => setFormStatus(e.target.value)}
                options={[
                  { value: 'completed', label: 'Active' },
                  { value: 'progress', label: 'On Leave' },
                  { value: 'pending', label: 'Inactive' }
                ]}
              />
            )}
          </div>

          <div className="border-t border-gray-100 my-3" />

          {/* Standard Fields (all roles) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="e.g. John"
              value={formFirstName}
              onChange={e => setFormFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              placeholder="e.g. Doe"
              value={formLastName}
              onChange={e => setFormLastName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. john.doe@example.com"
              value={formEmail}
              onChange={e => setFormEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +1 555-0100"
              value={formPhone}
              onChange={e => setFormPhone(e.target.value)}
              required
            />
          </div>

          {/* Role-Specific Fields */}
          {formRole === 'Tenant Admin' && (
            <>
              <div className="border-t border-gray-100 my-3" />
              <p className="text-xs font-bold text-[#1a472a] uppercase tracking-wider">Tenant Administration details</p>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Tenant / Learners Name"
                  placeholder="e.g. Apex Driving School"
                  value={formTenantName}
                  onChange={e => setFormTenantName(e.target.value)}
                  required
                />
                <Input
                  label="Business Registration Number (Optional)"
                  placeholder="e.g. TX-12345-B"
                  value={formBusinessReg}
                  onChange={e => setFormBusinessReg(e.target.value)}
                  hint="Recommended but optional"
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Address (Optional)"
                  placeholder="e.g. 123 Main St, Austin, TX"
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                />
              </div>
              {!editingMember && (
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter security password"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    required
                    hint="Temporary password for self-registration"
                  />
                </div>
              )}
            </>
          )}

          {formRole === 'Instructor' && (
            <>
              <div className="border-t border-gray-100 my-3" />
              <p className="text-xs font-bold text-[#1a472a] uppercase tracking-wider">Instructor credentials</p>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Employee ID (Optional)"
                  placeholder="e.g. INS-482"
                  value={formEmployeeId}
                  onChange={e => setFormEmployeeId(e.target.value)}
                />
                <Input
                  label="License / Certification Number (Optional)"
                  placeholder="e.g. LC-89301-A"
                  value={formLicenseNumber}
                  onChange={e => setFormLicenseNumber(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Specialization / Vehicle Type (Optional)"
                  placeholder="e.g. Class A Commercial Truck, Automatic Sedan"
                  value={formSpecialization}
                  onChange={e => setFormSpecialization(e.target.value)}
                />
              </div>
            </>
          )}

          {formRole === 'Front Desk' && (
            <>
              <div className="border-t border-gray-100 my-3" />
              <p className="text-xs font-bold text-[#1a472a] uppercase tracking-wider">Front Desk staff details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Employee ID (Optional)"
                  placeholder="e.g. FD-821"
                  value={formEmployeeId}
                  onChange={e => setFormEmployeeId(e.target.value)}
                />
                <Input
                  label="Department / Branch (Optional)"
                  placeholder="e.g. Downtown Office, Administration"
                  value={formDepartmentBranch}
                  onChange={e => setFormDepartmentBranch(e.target.value)}
                />
              </div>
              <div className="relative w-full" ref={shiftPickerRef}>
                <Input
                  label="Shift / Working Hours (Optional)"
                  placeholder="e.g. Morning (8:00 AM - 4:00 PM)"
                  value={
                    shiftName === 'Custom'
                      ? `Custom (${convert24to12(shiftStart24)} - ${convert24to12(shiftEnd24)})`
                      : `${shiftName} (${convert24to12(shiftStart24)} - ${convert24to12(shiftEnd24)})`
                  }
                  readOnly
                  onClick={() => setShowShiftPicker(true)}
                  icon={
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowShiftPicker(p => !p)
                      }}
                      className="text-gray-400 hover:text-[#1a472a] transition-colors cursor-pointer flex items-center justify-center h-full"
                    >
                      <Clock size={15} />
                    </button>
                  }
                />

                {showShiftPicker && (
                  <div className="absolute left-0 right-0 mt-1.5 p-4 bg-white border border-gray-200/80 rounded-2xl shadow-xl z-50 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Preset Selector */}
                    <div className="flex gap-3 items-center flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preset</span>
                      <div className="flex p-0.5 bg-gray-50 border border-gray-200/80 rounded-xl">
                        {['Morning', 'Custom'].map(name => {
                          const isActive = shiftName === name
                          return (
                            <button
                              type="button"
                              key={name}
                              onClick={() => {
                                setShiftName(name)
                                if (name === 'Morning') {
                                  setShiftStart24('08:00')
                                  setShiftEnd24('16:00')
                                }
                              }}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-[#1a472a] text-white shadow-sm'
                                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              {name === 'Morning' ? 'Morning (8:00 AM - 4:00 PM)' : 'Custom'}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Time Range Pickers */}
                    <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100">
                      {/* Start Time */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start</span>
                        <div 
                          className={`relative flex items-center ${
                            shiftName === 'Custom' ? 'cursor-pointer' : 'cursor-not-allowed'
                          }`} 
                          onClick={() => {
                            if (shiftName === 'Custom') {
                              shiftStartRef.current?.showPicker()
                            }
                          }}
                        >
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                            shiftName === 'Custom' ? 'text-[#1a472a]' : 'text-gray-400'
                          }`}>
                            <Clock size={13} />
                          </span>
                          <input
                            ref={shiftStartRef}
                            type="time"
                            className={`w-28 rounded-xl border border-gray-200 text-xs pl-8 pr-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788] font-medium text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-150 ${
                              shiftName === 'Custom' ? 'cursor-pointer' : 'cursor-not-allowed'
                            }`}
                            value={shiftStart24}
                            onChange={e => setShiftStart24(e.target.value)}
                            disabled={shiftName !== 'Custom'}
                          />
                        </div>
                      </div>

                      <span className="text-gray-300 text-sm">—</span>

                      {/* End Time */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End</span>
                        <div 
                          className={`relative flex items-center ${
                            shiftName === 'Custom' ? 'cursor-pointer' : 'cursor-not-allowed'
                          }`} 
                          onClick={() => {
                            if (shiftName === 'Custom') {
                              shiftEndRef.current?.showPicker()
                            }
                          }}
                        >
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                            shiftName === 'Custom' ? 'text-[#1a472a]' : 'text-gray-400'
                          }`}>
                            <Clock size={13} />
                          </span>
                          <input
                            ref={shiftEndRef}
                            type="time"
                            className={`w-28 rounded-xl border border-gray-200 text-xs pl-8 pr-2.5 py-1.5 bg-white outline-none focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788] font-medium text-gray-700 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-150 ${
                              shiftName === 'Custom' ? 'cursor-pointer' : 'cursor-not-allowed'
                            }`}
                            value={shiftEnd24}
                            onChange={e => setShiftEnd24(e.target.value)}
                            disabled={shiftName !== 'Custom'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {formRole === 'Student' && (
            <>
              <div className="border-t border-gray-100 my-3" />
              <p className="text-xs font-bold text-[#1a472a] uppercase tracking-wider">Student onboarding information</p>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Student ID (Optional)"
                  placeholder="e.g. STU-209"
                  value={formStudentId}
                  onChange={e => setFormStudentId(e.target.value)}
                />
                <Input
                  label="Date of Birth (Optional)"
                  type="date"
                  value={formDob}
                  onChange={e => setFormDob(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Target License Class (Optional)"
                  placeholder="e.g. Class D Standard, Commercial Class B"
                  value={formTargetLicense}
                  onChange={e => setFormTargetLicense(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* View User Details Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={`User Details: ${viewingMember?.name}`}
        footer={
          <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
        }
      >
        {viewingMember && (
          <div className="space-y-5">
            {/* Header profile card info */}
            <div className="relative flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
              <Avatar name={viewingMember.name} size="lg" />
              <div>
                <h4 className="font-bold text-gray-900 text-base leading-snug">{viewingMember.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{viewingMember.email}</p>
                <div className="mt-2">
                  <Badge variant="dark">{viewingMember.role}</Badge>
                </div>
              </div>
              {viewingMember.role !== 'Student' && (
                <div className="absolute top-4 right-4">
                  <Badge variant={viewingMember.status} dot>{viewingMember.statusLabel}</Badge>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100" />

            {/* Profile Fields Details */}
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-[#1a472a] uppercase tracking-wider">Contact Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">First Name</span>
                  <span className="text-gray-800 font-medium">{viewingMember.firstName || viewingMember.name?.split(' ')[0]}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Last Name</span>
                  <span className="text-gray-800 font-medium">{viewingMember.lastName || viewingMember.name?.split(' ').slice(1).join(' ')}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Email Address</span>
                  <span className="text-gray-800 font-medium">{viewingMember.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Phone Number</span>
                  <span className="text-gray-800 font-medium">{viewingMember.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Role specific display fields */}
              {viewingMember.role === 'Tenant Admin' && (
                <>
                  <div className="border-t border-gray-100 my-3" />
                  <h5 className="text-xs font-bold text-[#1a472a] uppercase tracking-wider">Tenant Administration Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Tenant / Learners Name</span>
                      <span className="text-gray-800 font-medium">{viewingMember.tenantName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Business Registration #</span>
                      <span className="text-gray-800 font-medium font-mono">{viewingMember.businessReg || 'N/A'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Address</span>
                      <span className="text-gray-800 font-medium">{viewingMember.address || 'N/A'}</span>
                    </div>
                  </div>
                </>
              )}

              {viewingMember.role === 'Instructor' && (
                <>
                  <div className="border-t border-gray-100 my-3" />
                  <h5 className="text-xs font-bold text-[#1a472a] uppercase tracking-wider">Instructor Roster Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Employee ID</span>
                      <span className="text-gray-800 font-medium font-mono">{viewingMember.employeeId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">License Number</span>
                      <span className="text-gray-800 font-medium">{viewingMember.licenseNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Specialization / Vehicle</span>
                      <span className="text-gray-800 font-medium">{viewingMember.specialization || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Classes Completed</span>
                      <span className="text-gray-800 font-medium font-mono">{viewingMember.classes !== undefined ? `${viewingMember.classes} classes` : '0 classes'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Rating</span>
                      <span className="text-amber-500 font-bold">★ {viewingMember.rating || '5.0'}</span>
                    </div>
                  </div>
                </>
              )}

              {viewingMember.role === 'Front Desk' && (
                <>
                  <div className="border-t border-gray-100 my-3" />
                  <h5 className="text-xs font-bold text-[#1a472a] uppercase tracking-wider">Front Desk Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Employee ID</span>
                      <span className="text-gray-800 font-medium font-mono">{viewingMember.employeeId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Shift / Hours</span>
                      <span className="text-gray-800 font-medium">{viewingMember.shift || 'N/A'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Department / Branch</span>
                      <span className="text-gray-800 font-medium">{viewingMember.departmentBranch || 'N/A'}</span>
                    </div>
                  </div>
                </>
              )}

              {viewingMember.role === 'Student' && (
                <>
                  <div className="border-t border-gray-100 my-3" />
                  <h5 className="text-xs font-bold text-[#1a472a] uppercase tracking-wider">Student Academic Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Student ID</span>
                      <span className="text-gray-800 font-medium font-mono">{viewingMember.studentId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Date of Birth</span>
                      <span className="text-gray-800 font-medium">{viewingMember.dob || 'N/A'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider mb-0.5">Target License Class</span>
                      <span className="text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-2.5 py-0.5 text-xs font-semibold inline-block">{viewingMember.targetLicense || 'N/A'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
