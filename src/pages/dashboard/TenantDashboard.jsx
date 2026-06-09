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
  HelpCircle
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
  `
  document.head.appendChild(style)
}

function PageFade({ children, pageKey }) {
  return (
    <div
      key={pageKey}
      style={{ animation: 'pageFadeIn 0.25s ease-out both' }}
      className="w-full"
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

function Input({ label, id, error, hint, icon, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        )}
        <input id={id} {...props}
          className={`w-full rounded-xl border text-sm py-2.5 outline-none transition-all
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
      {label && <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{label}</label>}
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
      {label && <label htmlFor={id} className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{label}</label>}
      <textarea id={id} rows={4} {...props}
        className={`w-full rounded-xl border text-sm px-3.5 py-2.5 outline-none resize-none transition-all
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

function SettingsPageLayout({ section, setSection, onTriggerToast, currentUser, onUpdateProfile }) {
  const SETTINGS_SECTIONS = [
    { id: 'profile',       label: 'Profile',         icon: User },
    { id: 'general',       label: 'General Settings',icon: Settings }
  ]

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full items-start">
      {/* Settings sidebar */}
      <aside className="w-full md:w-56 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">Category</p>
        <nav className="space-y-1">
          {SETTINGS_SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer
                  ${section === s.id
                    ? 'bg-[#d8f3dc] text-[#1a472a]'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
                <Icon size={16} className="flex-shrink-0" />
                {s.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Content panel */}
      <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 w-full">
        {section === 'profile'  && (
          <ProfileSettingsPanel 
            currentUser={currentUser} 
            onUpdateProfile={onUpdateProfile} 
            onTriggerToast={onTriggerToast} 
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

function DataTable({ columns, data, onRowClick, selectable, actions }) {
  const [selected, setSelected] = useState([])
  const [sortCol, setSortCol] = useState(null)
  const [sortDir, setSortDir] = useState("asc")

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
          <Button size="xs" variant="danger" icon={<Trash2 size={12}/>}>Delete</Button>
          <Button size="xs" variant="outline">Export</Button>
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
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
  const { user, currentRole, getInviteableRoles, logout } = useAuth()
  const { getActiveSessions, revokeSession } = useAuthStore()
  const navigate = useNavigate()
  const inviteableRoles = getInviteableRoles()
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

  // Team Members States
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Alice Johnson', role: 'Instructor', email: 'alice.j@dsms.com', status: 'completed', statusLabel: 'Active', classes: 24, rating: 4.9 },
    { id: 2, name: 'Bob Smith', role: 'Instructor', email: 'bob.s@dsms.com', status: 'completed', statusLabel: 'Active', classes: 18, rating: 4.7 },
    { id: 3, name: 'Charlie Davis', role: 'Front Desk Operator', email: 'charlie.d@dsms.com', status: 'progress', statusLabel: 'On Leave', classes: 0, rating: 4.5 },
    { id: 4, name: 'Diana Prince', role: 'Instructor', email: 'diana.p@dsms.com', status: 'completed', statusLabel: 'Active', classes: 30, rating: 5.0 },
    { id: 5, name: 'Ethan Hunt', role: 'Front Desk Operator', email: 'ethan.h@dsms.com', status: 'pending', statusLabel: 'Inactive', classes: 0, rating: 4.2 }
  ])
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [editingMemberRole, setEditingMemberRole] = useState('')
  const [editingMemberStatus, setEditingMemberStatus] = useState('')

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

  // Team Member Handlers
  const handleEditMemberClick = (member) => {
    setEditingMember(member)
    setEditingMemberRole(member.role)
    setEditingMemberStatus(member.status)
    setMemberModalOpen(true)
  }

  const handleSaveMember = () => {
    const statusLabelMap = {
      completed: 'Active',
      progress: 'On Leave',
      pending: 'Inactive'
    }
    setTeamMembers(prev => prev.map(m => m.id === editingMember.id ? { 
      ...m, 
      role: editingMemberRole, 
      status: editingMemberStatus, 
      statusLabel: statusLabelMap[editingMemberStatus] || 'Active' 
    } : m))
    addToast('success', 'Member Record Saved', `Updated details for ${editingMember.name}.`)
    setMemberModalOpen(false)
    setEditingMember(null)
  }

  // Fetch active sessions
  const fetchSessions = async (showLoading = true) => {
    if (showLoading) {
      setSessionsLoading(true)
    }
    try {
      const list = await getActiveSessions()
      setSessions(list)
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
    { icon: Users, label: 'Teams', id: 'team' }
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

  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
  }, [teamMembers, memberSearch])

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
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1a472a] border-t-transparent" />
              <span className="text-sm font-semibold text-gray-600">Rotating control node keys...</span>
            </div>
          ) : (
            <PageFade pageKey={activeTab}>
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

              {activeTab === 'team' && (
                <div className="space-y-6">
                  <PageHeader
                    title="Cohort Operations & Team"
                    subtitle="Manage system instructors, operators, and coordinators verified under your local region."
                    actions={
                      <Button variant="primary" icon={<UserPlus size={14} />} onClick={() => addToast('info', 'Add Team Member', 'Invite team member dialog triggered. Use Invite Generator to create link.')}>Add Member</Button>
                    }
                  />

                  <Card>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 max-w-md">
                                <Search size={15} className="text-gray-400" />
                                <input
                                  placeholder="Search cohort members by name..."
                                  className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
                                  value={memberSearch}
                                  onChange={e => memberSearch === undefined ? undefined : setMemberSearch(e.target.value)}
                                />
                              </div>

                              <DataTable
                                columns={[
                                  { key: "name", label: "Name", render: (v, row) => (
                                    <div className="flex items-center gap-3">
                                      <Avatar name={v} size="sm" />
                                      <div>
                                        <p className="font-semibold text-gray-900 leading-none">{v}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">{row.email}</p>
                                      </div>
                                    </div>
                                  )},
                                  { key: "role", label: "Role", render: (v) => <span className="font-medium text-gray-700">{v}</span> },
                                  { key: "status", label: "Status", render: (v, row) => <Badge variant={v} dot>{row.statusLabel}</Badge> },
                                  { key: "classes", label: "Completed Classes", render: (v) => <span className="font-mono text-gray-600">{v} classes</span> },
                                  { key: "rating", label: "Rating", render: (v) => <span className="font-semibold text-amber-600">★ {v}</span> }
                                ]}
                                data={filteredTeamMembers}
                                selectable
                                actions={(row) => (
                                  <div className="flex items-center gap-1">
                                    <IconButton icon={<Edit2 size={13}/>} size="sm" onClick={() => handleEditMemberClick(row)} title="Edit Member Role/Status" />
                                  </div>
                                )}
                              />
                    </div>
                  </Card>
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
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <PageHeader
                    title="Control Configuration"
                    subtitle="Manage personal records, UI preferences, and authentication rules."
                  />
                  <SettingsPageLayout
                    section={settingsSection}
                    setSection={setSettingsSection}
                    onTriggerToast={addToast}
                    currentUser={currentUser}
                    onUpdateProfile={(updatedData) => setCurrentUser(prev => ({ ...prev, ...updatedData }))}
                  />
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

      {/* Edit Team Member Modal */}
      <Modal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title={`Edit Member Roster Details: ${editingMember?.name}`}
        footer={
          <>
            <Button variant="outline" onClick={() => setMemberModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveMember}>Save Details</Button>
          </>
        }
      >
        {editingMember && (
          <div className="space-y-4">
            <Select
              label="Assigned System Role"
              value={editingMemberRole}
              onChange={e => setEditingMemberRole(e.target.value)}
              options={[
                { value: 'Instructor', label: 'Instructor' },
                { value: 'Front Desk Operator', label: 'Front Desk Operator' }
              ]}
            />
            <Select
              label="Availability Status"
              value={editingMemberStatus}
              onChange={e => setEditingMemberStatus(e.target.value)}
              options={[
                { value: 'completed', label: 'Active' },
                { value: 'progress', label: 'On Leave' },
                { value: 'pending', label: 'Inactive' }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
