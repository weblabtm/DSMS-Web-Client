/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef, useMemo } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart2,
  Users,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Video,
  Clock,
  Pause,
  Play,
  Square,
  User,
  LogOut,
  Moon,
  Sun,
  Filter,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  MessageCircle,
  Shield,
  CreditCard,
  Zap,
  RefreshCw
} from "lucide-react";

// ==========================================
// 1. UTILITIES & KEYFRAMES
// ==========================================

function injectSkeletonKeyframes() {
  if (document.getElementById("sk-keyframes")) return;
  const style = document.createElement("style");
  style.id = "sk-keyframes";
  style.textContent = `
    @keyframes skshimmer {
      0% { background-position: -800px 0; }
      100% { background-position: 800px 0; }
    }
    @keyframes pageFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ==========================================
// 2. ATOMIC ELEMENTS & SKELETONS
// ==========================================

function Skeleton({ className = "", circle = false, style = {} }) {
  return (
    <div
      className={`${circle ? "rounded-full" : "rounded-xl"} ${className}`}
      style={{
        background: "linear-gradient(90deg, #f0f2f0 25%, #e4eae4 50%, #f0f2f0 75%)",
        backgroundSize: "800px 100%",
        animation: "skshimmer 1.6s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

function PageFade({ children, pageKey }) {
  return (
    <div
      key={pageKey}
      style={{ animation: "pageFadeIn 0.25s ease-out both" }}
      className="w-full"
    >
      {children}
    </div>
  );
}

function Spinner({ size = "md", color = "#1a472a" }) {
  const sizes = { xs: 12, sm: 16, md: 20, lg: 28, xl: 36 };
  const px = sizes[size] || 20;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin flex-shrink-0"
      style={{ color }}
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function LiveDot({ label = "Live" }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52b788] opacity-60" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-[#1a472a]" />
      </span>
      <span className="text-xs font-semibold text-[#1a472a]">{label}</span>
    </div>
  );
}

function DonezoLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="15" fill="#1a472a"/>
      <circle cx="16" cy="16" r="9" fill="none" stroke="#52b788" strokeWidth="2.5"/>
      <circle cx="16" cy="16" r="4" fill="#52b788"/>
    </svg>
  );
}

function Avatar({ name, src, size = "md", online }) {
  const sizes = {
    xs: "w-6 h-6 text-[9px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const AVATAR_COLORS = [
    "bg-purple-100 text-purple-700",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
    "bg-orange-100 text-orange-700",
  ];
  const colorIdx = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
  return (
    <div className="relative inline-flex flex-shrink-0">
      <div className={`${sizes[size] || sizes.md} rounded-full flex items-center justify-center font-semibold overflow-hidden
                       ${src ? "" : AVATAR_COLORS[colorIdx]}`}>
        {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initials}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white
          ${online ? "bg-green-500" : "bg-gray-300"}`} />
      )}
    </div>
  );
}

function AvatarGroup({ names, max = 3 }) {
  const shown = names.slice(0, max);
  const rest = names.length - max;
  return (
    <div className="flex -space-x-2">
      {shown.map((name, i) => (
        <div key={i} className="ring-2 ring-white rounded-full">
          <Avatar name={name} size="sm" />
        </div>
      ))}
      {rest > 0 && (
        <div className="w-8 h-8 rounded-full ring-2 ring-white bg-gray-100 
                        flex items-center justify-center text-xs font-semibold text-gray-600">
          +{rest}
        </div>
      )}
    </div>
  );
}

function Badge({ variant = "default", children, dot }) {
  const variants = {
    default:    "bg-gray-100 text-gray-600",
    completed:  "bg-[#d1fae5] text-[#065f46]",
    progress:   "bg-[#fef3c7] text-[#92400e]",
    pending:    "bg-[#fee2e2] text-[#991b1b]",
    info:       "bg-blue-50 text-blue-700",
    warning:    "bg-amber-50 text-amber-700",
    green:      "bg-[#d8f3dc] text-[#1a472a]",
    dark:       "bg-[#1a472a] text-white",
  };
  const dotColors = {
    completed: "bg-[#052e16]",
    progress: "bg-amber-500",
    pending: "bg-red-500",
    info: "bg-blue-500",
    default: "bg-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.default}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />}
      {children}
    </span>
  );
}

// ==========================================
// 3. CORE SKELETON BLOCKS
// ==========================================

function StatCardSkeleton({ hero = false }) {
  return (
    <div className={`rounded-2xl p-5 space-y-3 shadow-sm border border-gray-100/50 ${hero ? "bg-[#1a472a]/10" : "bg-white"}`}>
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton circle className="w-7 h-7" />
      </div>
      <Skeleton className="h-10 w-16 mt-1" />
      <div className="flex items-center gap-2">
        <Skeleton circle className="w-3 h-3" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  );
}

function StatRowSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCardSkeleton hero />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}

function CardSkeleton({ lines = 3, hasHeader = true, hasChart = false, height }) {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm border border-gray-50" style={height ? { height } : {}}>
      {hasHeader && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      )}
      {hasChart && <Skeleton className="w-full rounded-xl" style={{ height: 120 }} />}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${95 - i * 12}%` }} />
        ))}
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 4, widths }) {
  const defaultWidths = Array.from({ length: cols }, (_, i) =>
    i === 0 ? "55%" : `${30 + Math.floor(i * 13)}%`
  );
  const w = widths || defaultWidths;
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-gray-100">
        {w.map((width, i) => (
          <Skeleton key={i} className="h-3" style={{ width }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 last:border-0">
          {w.map((width, ci) => (
            ci === 0 ? (
              <div key={ci} className="flex items-center gap-2.5" style={{ width }}>
                <Skeleton circle className="w-7 h-7 flex-shrink-0" />
                <Skeleton className="h-3.5 flex-1" />
              </div>
            ) : (
              <Skeleton key={ci} className="h-3" style={{ width }} />
            )
          ))}
        </div>
      ))}
    </div>
  );
}

function ListItemSkeleton({ count = 4, withAvatar = true, withBadge = true }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
          {withAvatar && <Skeleton circle className="w-8 h-8 flex-shrink-0" />}
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-2.5 w-48" />
          </div>
          {withBadge && <Skeleton className="h-5 w-16 rounded-full" />}
        </div>
      ))}
    </div>
  );
}

function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      {/* Stat cards */}
      <StatRowSkeleton />
      {/* Mid row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CardSkeleton hasHeader hasChart height={220} />
        </div>
        <CardSkeleton hasHeader lines={1} height={220} />
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-24 rounded-xl" />
          </div>
          <ListItemSkeleton count={4} />
        </div>
        <CardSkeleton hasHeader lines={0} hasChart height={200} />
        <div className="rounded-2xl p-5 bg-[#0d2818]/10 space-y-4 border border-gray-100">
          <Skeleton className="h-3.5 w-24" style={{ background: "rgba(26, 71, 42, 0.15)" }} />
          <Skeleton className="h-12 w-36 mx-auto rounded-xl" style={{ background: "rgba(26, 71, 42, 0.1)" }} />
          <div className="flex justify-center gap-3">
            <Skeleton circle className="w-11 h-11" style={{ background: "rgba(26, 71, 42, 0.15)" }} />
            <Skeleton circle className="w-11 h-11" style={{ background: "rgba(26, 71, 42, 0.15)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. BUTTONS & UI INTERACTIVES
// ==========================================

function Button({ variant = "primary", size = "md", icon, children, onClick, disabled, className = "" }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary:   "bg-[#1a472a] text-white hover:bg-[#2d6a4f] focus:ring-[#1a472a]",
    outline:   "border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-300",
    ghost:     "text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
    danger:    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
    success:   "bg-[#52b788] text-white hover:bg-[#3da06e] focus:ring-[#52b788]",
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
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

function IconButton({ icon, onClick, variant = "ghost", size = "md", title }) {
  const sizes = { sm: "w-7 h-7", md: "w-9 h-9", lg: "w-11 h-11" };
  return (
    <button
      title={title}
      onClick={onClick}
      className={`${sizes[size] || sizes.md} flex items-center justify-center rounded-xl transition-all
        ${variant === "ghost" ? "text-gray-500 hover:bg-gray-100" : "bg-[#1a472a] text-white hover:bg-[#2d6a4f]"}`}
    >
      {icon}
    </button>
  );
}

function LoadingButton({ loading, children, loadingText, ...props }) {
  return (
    <Button {...props} disabled={loading}>
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          {loadingText || "Loading..."}
        </>
      ) : children}
    </Button>
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
      <div onClick={() => setOpen(p => !p)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-gray-100 
                        py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1 border-t border-gray-100" />
            ) : (
              <button key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
                  ${item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-[#f4f6f4]"}`}>
                {item.icon && <span className="text-gray-400">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. TOAST & NOTIFICATION BELL
// ==========================================

function NotificationList({ items, onMarkRead }) {
  return (
    <ul className="divide-y divide-gray-50">
      {items.map(n => (
        <li key={n.id} className={`flex gap-3 p-4 transition-colors ${n.unread ? "bg-[#f0fdf4]" : ""}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
            ${n.type === "success" ? "bg-[#d1fae5] text-[#065f46]" :
              n.type === "warning" ? "bg-amber-50 text-amber-600" :
              n.type === "error"   ? "bg-red-50 text-red-600" :
                                     "bg-blue-50 text-blue-600"}`}>
            {n.type === "success" ? <CheckCircle size={16}/> :
             n.type === "warning" ? <AlertCircle size={16}/> :
             n.type === "error"   ? <XCircle size={16}/> : <Info size={16}/>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{n.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
            <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
          </div>
          {n.unread && (
            <button onClick={() => onMarkRead?.(n.id)}
              className="w-2 h-2 rounded-full bg-[#1a472a] mt-1.5 flex-shrink-0" />
          )}
        </li>
      ))}
      {items.length === 0 && (
        <li className="p-4 text-center text-xs text-gray-400">No new notifications</li>
      )}
    </ul>
  );
}

function NotificationPopover({ notifications, onMarkAllRead, onMarkRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const unread = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(p => !p)}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl
                   text-gray-500 hover:bg-gray-100 transition-colors">
        <Bell size={18}/>
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#1a472a] text-white
                           text-[9px] font-bold flex items-center justify-center">{unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unread > 0 && (
              <button onClick={onMarkAllRead} className="text-xs text-[#1a472a] font-medium hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            <NotificationList items={notifications} onMarkRead={onMarkRead} />
          </div>
          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <button className="text-sm text-[#1a472a] font-medium hover:underline">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm transition-all duration-300
            ${toast.type === "success" ? "bg-white border-[#52b788]" :
              toast.type === "error"   ? "bg-white border-red-300" :
              toast.type === "warning" ? "bg-white border-amber-300" :
                                         "bg-white border-gray-200"}`}>
          <span className={`mt-0.5
            ${toast.type === "success" ? "text-[#1a472a]" :
              toast.type === "error"   ? "text-red-500" :
              toast.type === "warning" ? "text-amber-500" : "text-blue-500"}`}>
            {toast.type === "success" ? <CheckCircle size={16}/> :
             toast.type === "error"   ? <XCircle size={16}/> :
             toast.type === "warning" ? <AlertCircle size={16}/> : <Info size={16}/>}
          </span>
          <div className="flex-1">
            {toast.title && <p className="text-sm font-semibold text-gray-800">{toast.title}</p>}
            <p className="text-sm text-gray-600">{toast.message}</p>
          </div>
          <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600">
            <X size={14}/>
          </button>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 6. LAYOUT COMPONENTS (Sidebar, TopBar)
// ==========================================

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", badge: null, id: "dashboard" },
  { icon: CheckSquare,     label: "Tasks",     badge: "12", id: "tasks" },
  { icon: Calendar,        label: "Calendar",  badge: null, id: "calendar" },
  { icon: BarChart2,       label: "Analytics", badge: null, id: "analytics" },
  { icon: Users,           label: "Team",      badge: null, id: "team" },
];

const GENERAL_ITEMS = [
  { icon: Settings, label: "Settings", id: "settings" },
  { icon: User,     label: "Profile",  id: "profile" },
  { icon: LogOut,   label: "Logout",   id: "logout" },
];

function NavItem({ item, collapsed, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
        ${collapsed ? "justify-center" : ""}
        ${active
          ? "bg-[#1a472a] text-white"
          : "text-gray-500 hover:bg-[#d8f3dc] hover:text-[#1a472a]"
        }
      `}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
          ${active ? "bg-white/20 text-white" : "bg-[#1a472a] text-white"}`}>
          {item.badge}
        </span>
      )}
    </button>
  );
}

function SidebarLabel({ children, className = "" }) {
  return (
    <p className={`px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

function Sidebar({ collapsed, onToggle, activeId, onNavigate, onDownloadDemo }) {
  return (
    <aside className={`
      relative flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out z-30
      ${collapsed ? "w-[72px]" : "w-[260px]"}
    `}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 
                   flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
        <DonezoLogo />
        {!collapsed && <span className="font-bold text-lg text-gray-900">Donezo</span>}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {!collapsed && <SidebarLabel>Menu</SidebarLabel>}
        {NAV_ITEMS.map(item => (
          <NavItem key={item.id} item={item} collapsed={collapsed}
            active={activeId === item.id} onClick={() => onNavigate(item.id)} />
        ))}
        {!collapsed && <SidebarLabel className="mt-4">General</SidebarLabel>}
        {collapsed && <div className="my-3 border-t border-gray-100" />}
        {GENERAL_ITEMS.map(item => (
          <NavItem key={item.id} item={item} collapsed={collapsed}
            active={activeId === item.id} onClick={() => onNavigate(item.id)} />
        ))}
      </nav>

      {/* Bottom promo card */}
      {!collapsed && (
        <div className="m-3 p-4 rounded-2xl bg-[#1a472a] text-white">
          <p className="text-xs text-white/60 mb-1">Pro tip</p>
          <p className="font-bold text-sm mb-1">Download our Mobile App</p>
          <p className="text-xs text-white/60 mb-3">Get easy in another way</p>
          <button onClick={onDownloadDemo} className="w-full py-2 rounded-xl bg-[#52b788] text-white text-sm font-semibold
                             hover:bg-[#3da06e] transition-colors cursor-pointer">
            Download
          </button>
        </div>
      )}
    </aside>
  );
}

function TopBar({ onSearch, notifications, onMarkAllRead, onMarkRead, currentUser, onNavigate, onLogout }) {
  const [query, setQuery] = useState("");
  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-100 z-20">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f4f6f4] border border-gray-100">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Search tasks or team..."
            className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white 
                          border border-gray-200 text-[10px] text-gray-400 font-mono">
            ⌘F
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <NotificationPopover 
          notifications={notifications} 
          onMarkAllRead={onMarkAllRead} 
          onMarkRead={onMarkRead} 
        />
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl 
                           text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <MessageCircle size={18} />
        </button>

        <div className="w-px h-6 bg-gray-100 mx-1" />

        {/* User Dropdown */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-50 transition-colors text-left cursor-pointer">
              <Avatar name={currentUser.name} size="sm" online />
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">{currentUser.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{currentUser.email}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          }
          items={[
            { label: "View Profile",  icon: <User size={14}/>,    onClick: () => onNavigate("profile") },
            { label: "Settings",      icon: <Settings size={14}/>, onClick: () => onNavigate("settings") },
            { divider: true },
            { label: "Log out",       icon: <LogOut size={14}/>,  onClick: onLogout, danger: true },
          ]}
        />
      </div>
    </header>
  );
}

// ==========================================
// 7. CARDS & CHARTS
// ==========================================

function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

function StatCard({ label, value, trend, trendLabel, hero, onActionClick }) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  return (
    <div className={`relative rounded-2xl p-5 shadow-sm border border-gray-100/50 ${hero ? "bg-[#1a472a] text-white" : "bg-white text-gray-900"}`}>
      <button
        onClick={onActionClick}
        className={`absolute top-4 right-4 w-7 h-7 rounded-full border flex items-center justify-center
                          transition-colors hover:scale-110 cursor-pointer
                          ${hero ? "border-white/30 hover:bg-white/10" : "border-gray-200 hover:bg-gray-50"}`}
      >
        <ArrowUpRight size={13} />
      </button>
      <p className={`text-sm font-semibold ${hero ? "text-white/80" : "text-gray-600"}`}>{label}</p>
      <p className="text-4xl font-bold mt-2 mb-3 leading-none font-['DM_Mono']">{value}</p>
      {trend && (
        <div className={`flex items-center gap-1.5 text-xs ${hero ? "text-white/60" : "text-gray-400"}`}>
          <TrendIcon size={13} />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

function Card({ title, headerAction, children, className = "", padding = true }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100/80 ${padding ? "p-5" : ""} ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-semibold text-gray-800 text-[15px]">{title}</h3>}
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}

function DarkCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl p-5 bg-[#0d2818] text-white shadow-sm border border-[#1a472a]/20 ${className}`}
         style={{ backgroundImage: "radial-gradient(ellipse at top right, #1a472a 0%, #0d2818 70%)" }}>
      {title && <p className="text-sm font-semibold text-white/60 mb-3">{title}</p>}
      {children}
    </div>
  );
}

function PillBarChart({ data, height = 160 }) {
  const max = Math.max(...data.map(d => d.value), 10);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const pct = d.value / max;
        const barH = Math.max(pct * (height - 32), 12);
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            {d.label2 && <span className="text-[10px] text-gray-500 font-semibold">{d.label2}</span>}
            <div className="relative w-full flex justify-center" style={{ height: height - 24 }}>
              <div className="absolute bottom-0 w-full max-w-[36px] rounded-full"
                style={{
                  height: `${height - 24}px`,
                  background: "repeating-linear-gradient(-45deg,#e5e7eb 0px,#e5e7eb 3px,#f3f4f6 3px,#f3f4f6 8px)",
                  borderRadius: "999px",
                }}
              />
              <div
                className="absolute bottom-0 w-full max-w-[36px] rounded-full transition-all duration-700"
                style={{
                  height: `${barH}px`,
                  background: d.active ? "#52b788" : d.accent ? "#52b788" : "#1a472a",
                  borderRadius: "999px",
                }}
              />
            </div>
            <span className="text-[11px] text-gray-400 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data, width = 400, height = 120, color = "#1a472a" }) {
  if (!data || !data.length) return null;
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
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
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

function DonutChart({ segments, size = 120, thickness = 16 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  
  const segmentsWithOptions = segments.map((seg, idx) => {
    const dash = total > 0 ? (seg.value / total) * circumference : 0;
    const offset = segments.slice(0, idx).reduce((sum, s) => {
      const prevDash = total > 0 ? (s.value / total) * circumference : 0;
      return sum + prevDash;
    }, 0);
    return { ...seg, dash, offset };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {segmentsWithOptions.map((seg, i) => (
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
        <p className="text-2xl font-bold text-gray-900 font-['DM_Mono']">{value}</p>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value, max = 100, color = "#1a472a", showLabel = false, size = "md" }) {
  const pct = Math.round((value / max) * 100);
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 ${heights[size] || heights.md} rounded-full bg-gray-100 overflow-hidden`}>
        <div className={`${heights[size] || heights.md} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, background: color }} />
      </div>
      {showLabel && <span className="text-xs text-gray-500 font-semibold w-8 text-right font-['DM_Mono']">{pct}%</span>}
    </div>
  );
}

// ==========================================
// 8. LISTS (Activity, Tasks, Notification)
// ==========================================

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
  );
}

function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  return (
    <ul className="space-y-2">
      {tasks.map(task => (
        <li key={task.id}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 group transition-all">
          <button onClick={() => onToggle?.(task.id)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
              ${task.done ? "bg-[#1a472a] border-[#1a472a]" : "border-gray-300 hover:border-[#52b788]"}`}>
            {task.done && <Check size={11} className="text-white animate-in zoom-in-50 duration-150" />}
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
          <Badge variant={task.priority === "High" ? "pending" : task.priority === "Med" ? "progress" : "default"}>
            {task.priority}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

// ==========================================
// 9. DATA TABLE
// ==========================================

function DataTable({ columns, data, onRowClick, selectable, actions, onBulkDelete }) {
  const [selected, setSelected] = useState([]);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const toggleRow = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === data.length ? [] : data.map(r => r.id));

  const sorted = sortCol
    ? [...data].sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];
        const v = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === "asc" ? v : -v;
      })
    : data;

  const handleSort = (key) => {
    if (sortCol === key) setSortCol(null); // Clear sort on third click or cycle
    else { setSortCol(key); setSortDir("asc"); }
  };

  const handleBulkAction = () => {
    onBulkDelete?.(selected);
    setSelected([]);
  };

  return (
    <div className="w-full">
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-3 rounded-xl bg-[#d8f3dc] text-[#1a472a] animate-in slide-in-from-top-2">
          <span className="text-sm font-semibold">{selected.length} selected</span>
          <Button size="xs" variant="danger" icon={<Trash2 size={12}/>} onClick={handleBulkAction}>Delete Selected</Button>
          <Button size="xs" variant="outline" onClick={() => setSelected([])}>Clear</Button>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {selectable && (
                <th className="w-10 px-4 py-3 text-center">
                  <input type="checkbox" checked={data.length > 0 && selected.length === data.length}
                    onChange={toggleAll} className="rounded accent-[#1a472a] cursor-pointer"/>
                </th>
              )}
              {columns.map(col => (
                <th key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
                    ${col.sortable !== false ? "cursor-pointer hover:text-gray-800 select-none" : ""}`}>
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortCol === col.key && (
                      <span className="text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>
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
                className={`group transition-all ${onRowClick ? "cursor-pointer" : ""}
                  hover:bg-[#f4f6f4] ${selected.includes(row.id) ? "bg-[#f0fdf4]" : ""}`}>
                {selectable && (
                  <td className="px-4 py-3 text-center" onClick={e => { e.stopPropagation(); toggleRow(row.id); }}>
                    <input type="checkbox" checked={selected.includes(row.id)}
                      onChange={() => {}} className="rounded accent-[#1a472a] cursor-pointer"/>
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}

// ==========================================
// 10. MODALS & FORMS
// ==========================================

function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl", full: "max-w-full mx-4" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      {/* Dialog */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size] || widths.md} flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-250`}>
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
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>Confirm</Button>
      </>}>
      <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
    </Modal>
  );
}

function Input({ label, id, error, hint, icon, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700 block">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        )}
        <input id={id} {...props}
          className={`w-full rounded-xl border text-sm py-2.5 outline-none transition-all
            ${icon ? "pl-9 pr-3" : "px-3"}
            ${error
              ? "border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400"
              : "border-gray-200 focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788]"}`} />
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Select({ label, id, options, error, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700 block">{label}</label>}
      <div className="relative">
        <select id={id} {...props}
          className={`w-full rounded-xl border text-sm pl-3 pr-8 py-2.5 bg-white outline-none transition-all appearance-none cursor-pointer
            ${error ? "border-red-300" : "border-gray-200 focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788]"}`}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function Textarea({ label, id, error, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700 block">{label}</label>}
      <textarea id={id} rows={4} {...props}
        className={`w-full rounded-xl border text-sm px-3 py-2.5 outline-none resize-none transition-all
          ${error ? "border-red-300" : "border-gray-200 focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788]"}`} />
    </div>
  );
}

function Toggle({ label, checked, onChange, description }) {
  return (
    <div className="flex items-start gap-3">
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors mt-0.5 cursor-pointer
          ${checked ? "bg-[#1a472a]" : "bg-gray-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
                          transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function FormSection({ title, description, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-gray-100 last:border-0">
      <div>
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        {description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );
}

// ==========================================
// 11. NAVIGATION & WIDGETS
// ==========================================

function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer
            ${activeTab === tab.id
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"}`}>
          {tab.icon && tab.icon}
          {tab.label}
          {tab.count !== undefined && tab.count !== null && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
              ${activeTab === tab.id ? "bg-[#d8f3dc] text-[#1a472a]" : "bg-gray-200 text-gray-500"}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function TimeTrackerWidget({ onTriggerToast }) {
  const [seconds, setSeconds] = useState(5048); // 01:24:08
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const fmt = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, "0");
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };
  return (
    <DarkCard title="Time Tracker">
      <p className="text-4xl font-['DM_Mono'] font-medium tracking-wider text-center my-4">
        {fmt(seconds)}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => {
          setRunning(p => !p);
          onTriggerToast("info", "Timer Update", `Timer ${!running ? 'started' : 'paused'} at ${fmt(seconds)}`);
        }}
          className="w-11 h-11 rounded-full bg-white text-gray-800 flex items-center justify-center hover:scale-105 transition-transform shadow cursor-pointer">
          {running ? <Pause size={18}/> : <Play size={18} className="ml-0.5" />}
        </button>
        <button onClick={() => {
          onTriggerToast("warning", "Timer Reset", `Reset track session. Total tracked: ${fmt(seconds)}`);
          setSeconds(0);
          setRunning(false);
        }}
          className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow cursor-pointer">
          <Square size={18}/>
        </button>
      </div>
    </DarkCard>
  );
}

function ReminderCard({ title, time, onStart }) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Upcoming</p>
      <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-5">Time: {time}</p>
      <button onClick={onStart}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                   bg-[#1a472a] text-white font-semibold hover:bg-[#2d6a4f] transition-colors cursor-pointer">
        <Video size={16}/> Start Meeting
      </button>
    </Card>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#d8f3dc] flex items-center justify-center text-[#1a472a] mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs mb-4 leading-relaxed">{description}</p>}
      {action}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1 justify-end">
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}
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
      <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                   hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
        <ChevronRight size={15}/>
      </button>
    </div>
  );
}

function SearchFilterBar({ onSearch, filters, activeFilter, onFilterChange, onExportClick }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap bg-white p-4 rounded-2xl border border-gray-100/80 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 flex-1 min-w-[200px]">
        <Search size={15} className="text-gray-400" />
        <input placeholder="Search tasks..." onChange={e => onSearch(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {filters?.map(f => (
          <button key={f.id} onClick={() => onFilterChange(f.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer
              ${activeFilter === f.id
                ? "bg-[#1a472a] text-white border-[#1a472a]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#52b788]"}`}>
            {f.icon} {f.label}
          </button>
        ))}
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 cursor-pointer">
          <Filter size={14}/> Filters
        </button>
        <button onClick={onExportClick} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 cursor-pointer">
          <Download size={14}/> Export
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 12. ROUTE SPECIFIC VIEWS (General/Profile panels)
// ==========================================

function GeneralSettingsPanel({ onTriggerToast }) {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  
  const handleSave = () => {
    onTriggerToast("success", "General settings saved", "Workspace preferences updated successfully.");
  };

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
  );
}

function ProfileSettingsPanel({ currentUser, onUpdateProfile, onTriggerToast }) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [timezone, setTimezone] = useState("asia/colombo");
  const [language, setLanguage] = useState("en");

  const handleSave = () => {
    onUpdateProfile({ name, email, bio });
    onTriggerToast("success", "Profile updated", "Personal records saved successfully.");
  };

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
            <Button size="sm" variant="outline" icon={<Upload size={14}/>} onClick={() => onTriggerToast("info", "Upload File", "Mock upload file window triggered.")}>Upload</Button>
            <Button size="sm" variant="ghost" icon={<Trash2 size={14}/>} onClick={() => onTriggerToast("warning", "Avatar deleted", "Avatar deleted placeholder triggered.")}>Remove</Button>
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
          { value: "utc", label: "UTC" },
          { value: "asia/colombo", label: "Asia/Colombo (UTC+5:30)" },
          { value: "est", label: "Eastern Standard Time (UTC-5)" }
        ]} />
        <Select label="Language" id="prof-lang" value={language} onChange={e => setLanguage(e.target.value)} options={[
          { value: "en", label: "English" },
          { value: "lk", label: "Sinhala" }
        ]} />
      </FormSection>

      <div className="pt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={() => { setName(currentUser.name); setEmail(currentUser.email); setBio(currentUser.bio || ""); }}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}

function SettingsPageLayout({ section, setSection, onTriggerToast, currentUser, onUpdateProfile }) {
  const SETTINGS_SECTIONS = [
    { id: "profile",       label: "Profile",         icon: User },
    { id: "general",       label: "General Settings",icon: Settings }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full items-start">
      {/* Settings sidebar */}
      <aside className="w-full md:w-56 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">Category</p>
        <nav className="space-y-1">
          {SETTINGS_SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer
                  ${section === s.id
                    ? "bg-[#d8f3dc] text-[#1a472a]"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}>
                <Icon size={16} className="flex-shrink-0" />
                {s.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content panel */}
      <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 w-full">
        {section === "profile"  && (
          <ProfileSettingsPanel 
            currentUser={currentUser} 
            onUpdateProfile={onUpdateProfile} 
            onTriggerToast={onTriggerToast} 
          />
        )}
        {section === "general"  && (
          <GeneralSettingsPanel 
            onTriggerToast={onTriggerToast} 
          />
        )}
      </div>
    </div>
  );
}

// ==========================================
// 13. DEMO DASHBOARD PAGE COMPONENT
// ==========================================

export default function DemoDashboard() {
  // Styles load injection
  useEffect(() => {
    injectSkeletonKeyframes();
  }, []);

  // System level states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, tasks, calendar, analytics, team, settings, profile
  const [settingsSection, setSettingsSection] = useState("profile");
  const [loading, setLoading] = useState(false);
  
  // Modals & triggers
  const [openAddProject, setOpenAddProject] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Profile data state
  const [currentUser, setCurrentUser] = useState({
    name: "Totok Michael",
    email: "tmichael20@mail.com",
    bio: "Driving school management administrator & lead scheduling operator."
  });

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (type, title, message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Notifications mock data
  const [notifications, setNotifications] = useState([
    { id: 1, type: "success", title: "Schedule verified", body: "Instructor Alice schedule has been verified.", time: "2 mins ago", unread: true },
    { id: 2, type: "info", title: "New student registration", body: "Bob Smith signed up under Central Cluster.", time: "1 hour ago", unread: true },
    { id: 3, type: "warning", title: "MFA challenge threshold reached", body: "IP: 192.168.1.1 reached otp limit.", time: "3 hours ago", unread: false }
  ]);
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    addToast("success", "Notifications updated", "All notifications marked as read.");
  };

  // Mock database state
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design Donezo Theme Integration", due: "Due Jun 12, 2026", priority: "High", done: false },
    { id: 2, title: "Prisma Schema DB Optimization", due: "Due Jun 15, 2026", priority: "Med", done: true },
    { id: 3, title: "Redis Cache Clusters Initialization", due: "Due Jun 18, 2026", priority: "High", done: false },
    { id: 4, title: "SMS Outbound Text.lk Testing", due: "Due Jun 20, 2026", priority: "Low", done: false },
    { id: 5, title: "MinIO Driver Storage S3 Policies", due: "Due Jun 22, 2026", priority: "Med", done: false },
    { id: 6, title: "MFA Login Session Rotation Code", due: "Due Jun 25, 2026", priority: "High", done: true }
  ]);

  // Tasks form / filter state
  const [taskSearch, setTaskSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState("all"); // all, high, med, low
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Med");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Task filtering logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase());
      const matchesFilter = taskFilter === "all" || t.priority.toLowerCase() === taskFilter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [tasks, taskSearch, taskFilter]);

  const pagedTasks = useMemo(() => {
    const start = (currentPage - 1) * 4;
    return filteredTasks.slice(start, start + 4);
  }, [filteredTasks, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / 4));

  // Add Task handler
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      addToast("error", "Task title empty", "Please fill in a task title.");
      return;
    }
    const dueFormatted = newTaskDue ? `Due ${new Date(newTaskDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : "Due today";
    const newItem = {
      id: Date.now(),
      title: newTaskTitle,
      due: dueFormatted,
      priority: newTaskPriority,
      done: false
    };
    setTasks(prev => [newItem, ...prev]);
    setNewTaskTitle("");
    setNewTaskDue("");
    setOpenAddProject(false);
    addToast("success", "Task created", `"${newItem.title}" added with ${newItem.priority} priority.`);
  };

  const toggleTaskDone = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextDone = !t.done;
        addToast("success", nextDone ? "Task Completed" : "Task Re-opened", `"${t.title}" status changed.`);
        return { ...t, done: nextDone };
      }
      return t;
    }));
  };

  const triggerDeleteConfirm = (task) => {
    setTaskToDelete(task);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    addToast("warning", "Task deleted", `"${taskToDelete.title}" has been deleted.`);
    setTaskToDelete(null);
    setOpenDeleteConfirm(false);
  };

  // Team columns / data
  const teamColumns = [
    { key: "name", label: "Team Member", render: (v) => <span className="font-semibold text-gray-900 flex items-center gap-2"><Avatar name={v} size="xs" /> {v}</span> },
    { key: "role", label: "Role", render: (v) => <Badge variant="info">{v}</Badge> },
    { key: "status", label: "Status", render: (v) => <Badge variant={v === "Active" ? "completed" : "pending"} dot>{v}</Badge> },
    { key: "joined", label: "Joined Date" }
  ];

  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "Alice Johnson", role: "Instructor", status: "Active", joined: "May 10, 2025" },
    { id: 2, name: "Bob Smith", role: "Tenant Admin", status: "Active", joined: "Feb 12, 2024" },
    { id: 3, name: "Charlie Davis", role: "Front Desk", status: "Active", joined: "Jan 18, 2026" },
    { id: 4, name: "Diana Prince", role: "Branch Manager", status: "Suspended", joined: "Dec 05, 2024" },
    { id: 5, name: "Evan Wright", role: "Instructor", status: "Active", joined: "Nov 22, 2025" }
  ]);

  const handleBulkDeleteTeam = (ids) => {
    setTeamMembers(prev => prev.filter(t => !ids.includes(t.id)));
    addToast("danger", "Bulk Action completed", `${ids.length} team members removed.`);
  };

  // Mock static stats
  const statCardList = [
    { label: "Active Cohorts", value: "24", trend: "up", trendLabel: "Increased from last month", hero: true },
    { label: "Pending Driving Licences", value: "102", trend: "up", trendLabel: "14 signups today", hero: false },
    { label: "Active Rosters", value: "12", trend: "down", trendLabel: "Decreased from last week", hero: false },
    { label: "Total Revenue (LKR)", value: "3.4M", trendLabel: "Payout scheduled", hero: false }
  ];

  // Mock analytics charts data
  const pillChartData = [
    { label: "Mon", value: 12, label2: "12h" },
    { label: "Tue", value: 24, label2: "24h" },
    { label: "Wed", value: 18, label2: "18h", active: true },
    { label: "Thu", value: 32, label2: "32h" },
    { label: "Fri", value: 10, label2: "10h" },
    { label: "Sat", value: 8, label2: "8h" },
    { label: "Sun", value: 15, label2: "15h" }
  ];

  const lineChartData = [
    { value: 10 }, { value: 14 }, { value: 12 }, { value: 20 },
    { value: 17 }, { value: 25 }, { value: 22 }, { value: 30 }
  ];

  const donutSegments = [
    { value: 45, color: "#1a472a", label: "Completed" },
    { value: 30, color: "#52b788", label: "In Progress" },
    { value: 25, color: "#fee2e2", label: "Pending" }
  ];

  // Activities list
  const activityItems = [
    { user: "Alice Johnson", task: "Instructor Roster Verification", status: "completed", statusLabel: "Verified" },
    { user: "Bob Smith", task: "MinIO Storage Bucket Policies", status: "progress", statusLabel: "Coding" },
    { user: "Charlie Davis", task: "Student Registration Verification", status: "default", statusLabel: "Pending" }
  ];

  // Simulate loader wrapper
  const triggerSimulatedLoad = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast("success", "Synchronization done", "Latest metrics fetched from Central cluster.");
    }, 2000);
  };

  const handleLogout = () => {
    addToast("warning", "Signing out", "Rotated refresh tokens cleared.");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#f4f6f4] font-['DM_Sans'] overflow-hidden text-gray-800">
      {/* Toast container overlay */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* App Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(p => !p)} 
        activeId={activeTab} 
        onNavigate={(id) => {
          if (id === "logout") {
            handleLogout();
          } else {
            setActiveTab(id);
          }
        }}
        onDownloadDemo={() => addToast("info", "Pro Tip Download", "Demo mobile wrapper package downloading.")}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar header */}
        <TopBar 
          onSearch={(val) => {
            if (activeTab === "tasks") {
              setTaskSearch(val);
            }
          }}
          notifications={notifications}
          onMarkAllRead={markAllNotificationsRead}
          onMarkRead={markNotificationRead}
          currentUser={currentUser}
          onNavigate={(id) => setActiveTab(id)}
          onLogout={handleLogout}
        />

        {/* Main core content area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <DashboardPageSkeleton />
          ) : (
            <PageFade pageKey={activeTab}>
              {/* PAGE ROUTER RENDERING */}

              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  {/* Header Row */}
                  <PageHeader 
                    title="Donezo Dashboard" 
                    subtitle="Plan, prioritize, and accomplish your driving school tasks with ease."
                    actions={
                      <>
                        <Button variant="outline" icon={<RefreshCw size={14} />} onClick={triggerSimulatedLoad}>Sync Data</Button>
                        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setOpenAddProject(true)}>Add Project</Button>
                      </>
                    }
                  />

                  {/* Stat Cards KPI row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCardList.map((stat, i) => (
                      <StatCard 
                        key={i} 
                        label={stat.label} 
                        value={stat.value} 
                        trend={stat.trend} 
                        trendLabel={stat.trendLabel} 
                        hero={stat.hero}
                        onActionClick={() => addToast("info", "Metric Insights", `Viewing history details for ${stat.label}`)}
                      />
                    ))}
                  </div>

                  {/* Mid Chart Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Chart Card */}
                    <Card title="Activity Analytics" className="lg:col-span-2" headerAction={<LiveDot />}>
                      <div className="mb-4 h-32 w-full">
                        <LineChart data={lineChartData} />
                      </div>
                      <PillBarChart data={pillChartData} />
                    </Card>

                    {/* Right Time Tracker Widget */}
                    <TimeTrackerWidget onTriggerToast={addToast} />
                  </div>

                  {/* Bottom Info Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Activity List Card */}
                    <Card title="Recent Updates" headerAction={<Button variant="ghost" size="xs" onClick={() => addToast("info", "Activity Logs", "Viewing all updates logs.")}>View All</Button>}>
                      <ActivityList items={activityItems} />
                    </Card>

                    {/* Donut Progress Card */}
                    <Card title="Work Completion" className="flex flex-col items-center justify-center text-center">
                      <div className="my-2">
                        <DonutWithLabel value="75%" label="Capacity" segments={donutSegments} />
                      </div>
                      <div className="w-full space-y-2 mt-4">
                        <div className="flex justify-between text-xs font-semibold text-gray-500">
                          <span>Total Progress</span>
                          <span>75/100 tasks</span>
                        </div>
                        <ProgressBar value={75} showLabel={false} />
                      </div>
                    </Card>

                    {/* Upcoming reminders */}
                    <ReminderCard 
                      title="Instructor Shift Handoff" 
                      time="10:30 AM (UTC+5:30)" 
                      onStart={() => addToast("success", "Meeting Started", "Virtual meet video channel initialized.")} 
                    />
                  </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="space-y-6">
                  <PageHeader 
                    title="Tasks & Milestones" 
                    subtitle="Track operational rosters, uploads, and server certifications."
                    actions={
                      <Button variant="primary" icon={<Plus size={14} />} onClick={() => setOpenAddProject(true)}>Add Project</Button>
                    }
                  />

                  {/* Filters & Actions Bar */}
                  <SearchFilterBar 
                    onSearch={(val) => setTaskSearch(val)}
                    filters={[
                      { id: "all", label: "All Priorities" },
                      { id: "high", label: "High" },
                      { id: "med", label: "Medium" },
                      { id: "low", label: "Low" }
                    ]}
                    activeFilter={taskFilter}
                    onFilterChange={(id) => {
                      setTaskFilter(id);
                      setCurrentPage(1);
                    }}
                    onExportClick={() => addToast("success", "Export Triggered", "Comma separated value sheets downloaded.")}
                  />

                  {/* Task List container */}
                  <Card padding={false} className="border border-gray-100/80 shadow-sm">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 text-sm">Tasks Checklist</h3>
                      <Badge variant="green">{filteredTasks.length} total</Badge>
                    </div>
                    
                    {pagedTasks.length > 0 ? (
                      <div className="p-4 space-y-4">
                        <TaskList 
                          tasks={pagedTasks} 
                          onToggle={toggleTaskDone} 
                          onDelete={(id) => triggerDeleteConfirm(tasks.find(t => t.id === id))}
                          onEdit={(task) => addToast("info", "Edit Task", `Task edit trigger: ${task.title}`)}
                        />
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-semibold">Showing page {currentPage} of {totalPages}</span>
                          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                      </div>
                    ) : (
                      <EmptyState 
                        icon={<CheckSquare size={32}/>} 
                        title="No tasks match search criteria" 
                        description="Clear filters or enter a different term to view your schedule."
                        action={<Button variant="outline" size="sm" onClick={() => { setTaskSearch(""); setTaskFilter("all"); }}>Clear Filters</Button>}
                      />
                    )}
                  </Card>
                </div>
              )}

              {activeTab === "calendar" && (
                <div className="space-y-6">
                  <PageHeader 
                    title="Roster Calendar" 
                    subtitle="Interactive driving session schedule & cohort rotations."
                  />
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-gray-900 text-base">June 2026</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Today</Button>
                        <Button variant="outline" size="sm">Week</Button>
                        <Button variant="primary" size="sm">Month</Button>
                      </div>
                    </div>
                    
                    {/* Simple Roster Grid Calendar */}
                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 uppercase mb-2">
                      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 35 }).map((_, idx) => {
                        const dayNumber = (idx - 1) % 31 + 1;
                        const isValidDay = idx > 1 && idx < 33;
                        const hasEvent = isValidDay && (dayNumber === 12 || dayNumber === 18 || dayNumber === 25);
                        return (
                          <div 
                            key={idx} 
                            className={`min-h-[90px] rounded-xl border p-2 text-left flex flex-col justify-between transition-colors
                              ${isValidDay ? "bg-white border-gray-100 hover:bg-gray-50" : "bg-gray-50/50 border-gray-100 text-gray-300"}`}
                          >
                            <span className={`font-semibold ${dayNumber === 7 && isValidDay ? "text-[#1a472a] bg-[#d8f3dc] px-2 py-0.5 rounded-full inline-block w-fit" : ""}`}>
                              {isValidDay ? dayNumber : ""}
                            </span>
                            {hasEvent && (
                              <div className="text-[10px] bg-[#d8f3dc] text-[#1a472a] font-bold p-1 rounded-lg truncate border border-[#52b788]/20">
                                {dayNumber === 12 && "Donezo Integration"}
                                {dayNumber === 18 && "Redis Init"}
                                {dayNumber === 25 && "MFA Review"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <PageHeader 
                    title="Performance & Analytics" 
                    subtitle="Statistical metrics overview of Driving School operational loops."
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Traffic Metrics">
                      <div className="h-48">
                        <LineChart data={lineChartData} color="#52b788" />
                      </div>
                    </Card>
                    <Card title="Load Distribution">
                      <div className="h-48 flex justify-center items-center">
                        <PillBarChart data={pillChartData} />
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "team" && (
                <div className="space-y-6">
                  <PageHeader 
                    title="Team & Instructors" 
                    subtitle="Manage Driving Academy instructor cohorts and access roles."
                    actions={
                      <Button variant="primary" icon={<Plus size={14} />} onClick={() => addToast("info", "Add Member", "Open add cohort form.")}>Add Member</Button>
                    }
                  />
                  <Card padding={false} className="border border-gray-100 shadow-sm">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800 text-sm">Instructor Database</h3>
                      <Badge variant="info">{teamMembers.length} active</Badge>
                    </div>
                    <div className="p-4">
                      <DataTable 
                        columns={teamColumns} 
                        data={teamMembers} 
                        selectable 
                        actions={(row) => (
                          <>
                            <IconButton icon={<Edit2 size={13}/>} size="sm" onClick={() => addToast("info", "Edit Member", `Editing: ${row.name}`)} />
                            <IconButton icon={<Trash2 size={13}/>} size="sm" onClick={() => {
                              setTeamMembers(prev => prev.filter(t => t.id !== row.id));
                              addToast("warning", "Member removed", `Removed ${row.name} from the cluster.`);
                            }} />
                          </>
                        )}
                        onBulkDelete={handleBulkDeleteTeam}
                      />
                    </div>
                  </Card>
                </div>
              )}

              {(activeTab === "settings" || activeTab === "profile") && (
                <div className="space-y-6">
                  <PageHeader 
                    title="Control Configuration" 
                    subtitle="Manage personal records, UI variables, and authentication rules."
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

      {/* ── MODALS ── */}

      {/* Add Project / Task Modal */}
      <Modal 
        open={openAddProject} 
        onClose={() => setOpenAddProject(false)} 
        title="Add New Milestone / Project"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpenAddProject(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddTask}>Create Task</Button>
          </>
        }
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input 
            label="Project Title" 
            placeholder="e.g., Deploy Central Database Clusters" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <Select 
            label="Priority Tier" 
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value)}
            options={[
              { value: "High", label: "High Priority Alert" },
              { value: "Med", label: "Medium Priority Normal" },
              { value: "Low", label: "Low Priority Backlog" }
            ]}
          />
          <Input 
            label="Due Date" 
            type="date" 
            value={newTaskDue}
            onChange={(e) => setNewTaskDue(e.target.value)}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog 
        open={openDeleteConfirm}
        onClose={() => setOpenDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm File/Record Deletion"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"? This action will write to audit logs and cannot be undone.`}
        danger
      />
    </div>
  );
}
