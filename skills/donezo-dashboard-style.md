---
name: donezo-dashboard-style
description: Build production-grade React + Tailwind CSS dashboards in the "Donezo" style — a clean, modern SaaS UI with forest-green accents, white cards, pill shapes, and a rich component library. Use this skill whenever the user asks to build a dashboard, admin panel, SaaS UI, project tracker, analytics page, settings page, or any management interface in React. Covers every reusable component: sidebar (expanded + collapsed), topbar, stat cards, data tables, lists, charts, modals/dialogs, forms, settings pages, profile pages, notifications, dropdowns, tabs, badges, avatars, empty states, skeletons, toasts, and more. Also trigger when the user references the Donezo screenshot, asks to replicate this design style, or wants a polished green-and-white SaaS aesthetic in React + Tailwind.
---

# Donezo Design System — React + Tailwind CSS

A complete, production-ready component library for SaaS dashboards. Every component is a reusable React functional component using **only Tailwind utility classes** — no custom CSS needed.

---

## Stack & Setup

```jsx
// Required: Tailwind CSS (via CDN for artifacts, or installed for projects)
// Required: lucide-react for icons
import { useState, useEffect, useRef } from "react";
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Users, Settings,
  Bell, Search, ChevronLeft, ChevronRight, Plus, X, MoreHorizontal,
  TrendingUp, TrendingDown, ArrowUpRight, Video, Clock, Pause, Square,
  User, LogOut, Moon, Sun, Filter, Download, Upload, Eye, Edit2, Trash2,
  ChevronDown, Check, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";
```

### Tailwind Color Extension
Map Donezo tokens to Tailwind. In artifacts use inline style for brand colors, or extend config:
```js
// tailwind.config.js
theme: { extend: { colors: {
  brand: {
    50:  '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
    300: '#86efac', 400: '#4ade80', 500: '#22c55e',
    600: '#16a34a', 700: '#15803d', 800: '#166534',
    900: '#14532d', 950: '#052e16',
    dark: '#1a472a',   // primary — nav active, hero card, CTAs
    mid:  '#2d6a4f',   // hover states
    light:'#52b788',   // accents, chart highlights
    muted:'#d8f3dc',   // tag backgrounds, subtle hover
  }
}}}
```

**In artifacts without config**, use these direct Tailwind classes:
- Primary green: `bg-[#1a472a]` / `text-[#1a472a]`
- Light green bg: `bg-[#d8f3dc]` / `text-[#d8f3dc]`
- Accent green: `bg-[#52b788]`
- Page bg: `bg-[#f4f6f4]`

### Font
```jsx
// Add to document head or index.html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
// Apply globally: className="font-['DM_Sans']" on root, or set in tailwind base
```

---

## 1. Layout Shell

### Root App Shell (fully responsive)

The shell has three distinct modes driven by `useBreakpoint()`:
- **Mobile** (`< 768px`): sidebar is hidden, slides in as an overlay drawer triggered by hamburger in TopBar
- **Tablet** (`768px–1023px`): sidebar is permanently collapsed (icon-only, 72px)
- **Desktop** (`≥ 1024px`): sidebar is expanded (260px) and can be manually collapsed

```jsx
// Breakpoint hook — use throughout all components
function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
  });
  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth;
      setBp(w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return bp; // "mobile" | "tablet" | "desktop"
}

function AppShell({ children }) {
  const bp = useBreakpoint();
  // Desktop: user can manually collapse. Tablet: always collapsed. Mobile: always hidden (drawer).
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarCollapsed = bp === "tablet" ? true : bp === "mobile" ? false : desktopCollapsed;
  const showSidebar = bp !== "mobile"; // inline sidebar only on tablet/desktop

  // Close drawer on route change / resize to non-mobile
  useEffect(() => { if (bp !== "mobile") setDrawerOpen(false); }, [bp]);

  return (
    <div className="flex h-screen bg-[#f4f6f4] font-['DM_Sans'] overflow-hidden">
      {/* Inline sidebar — tablet & desktop only */}
      {showSidebar && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setDesktopCollapsed(p => !p)}
          showToggle={bp === "desktop"}
        />
      )}

      {/* Mobile drawer */}
      {bp === "mobile" && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300
              ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white shadow-2xl
                           transition-transform duration-300 ease-in-out
                           ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <Sidebar collapsed={false} showToggle={false} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar onMenuClick={() => setDrawerOpen(p => !p)} showMenuBtn={bp === "mobile"} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 2. Sidebar — Expanded & Collapsed

```jsx
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

function Sidebar({ collapsed, onToggle, showToggle = true, activeId, onNavigate }) {
  return (
    <aside className={`
      relative flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300 ease-in-out
      ${collapsed ? "w-[72px]" : "w-[260px]"}
    `}>
      {/* Toggle button — desktop only */}
      {showToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-white border border-gray-200
                     flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}

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
            active={activeId === item.id} onClick={() => onNavigate?.(item.id)} />
        ))}
        {!collapsed && <SidebarLabel className="mt-4">General</SidebarLabel>}
        {collapsed && <div className="my-3 border-t border-gray-100" />}
        {GENERAL_ITEMS.map(item => (
          <NavItem key={item.id} item={item} collapsed={collapsed}
            active={activeId === item.id} onClick={() => onNavigate?.(item.id)} />
        ))}
      </nav>

      {/* Bottom promo card — hidden when collapsed */}
      {!collapsed && (
        <div className="m-3 p-4 rounded-2xl bg-[#1a472a] text-white">
          <p className="text-xs text-white/60 mb-1">Pro tip</p>
          <p className="font-bold text-sm mb-1">Download our Mobile App</p>
          <p className="text-xs text-white/60 mb-3">Get easy in another way</p>
          <button className="w-full py-2 rounded-xl bg-[#52b788] text-white text-sm font-semibold
                             hover:bg-[#3da06e] transition-colors">
            Download
          </button>
        </div>
      )}
    </aside>
  );
}

function NavItem({ item, collapsed, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
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

function DonezoLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="15" fill="#1a472a"/>
      <circle cx="16" cy="16" r="9" fill="none" stroke="#52b788" strokeWidth="2.5"/>
      <circle cx="16" cy="16" r="4" fill="#52b788"/>
    </svg>
  );
}
```

---

## 3. Top Bar

```jsx
function TopBar({ onSearch, onMenuClick, showMenuBtn = false }) {
  const [query, setQuery] = useState("");
  return (
    <header className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 bg-white border-b border-gray-100">
      {/* Mobile hamburger */}
      {showMenuBtn && (
        <button onClick={onMenuClick}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 flex-shrink-0">
          <Menu size={20} />
        </button>
      )}

      {/* Search */}
      <div className="flex-1 max-w-xs sm:max-w-md">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#f4f6f4] border border-gray-100">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search task..."
            className="flex-1 bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none min-w-0"
          />
          <kbd className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white
                          border border-gray-200 text-[10px] text-gray-400 font-mono flex-shrink-0">
            ⌘F
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        <TopBarIconBtn icon={<Bell size={18} />} badge={3} />
        {/* Hide mail icon on very small screens */}
        <span className="hidden sm:block">
          <TopBarIconBtn icon={<Mail size={18} />} />
        </span>

        <div className="w-px h-6 bg-gray-100 mx-1 hidden sm:block" />

        {/* User — name+email hidden on mobile, avatar always shown */}
        <button className="flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-gray-50 transition-colors">
          <Avatar name="Totok Michael" size="sm" />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-none">Totok Michael</p>
            <p className="text-[11px] text-gray-400 mt-0.5">tmichael20@mail.com</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}

function TopBarIconBtn({ icon, badge }) {
  return (
    <button className="relative w-9 h-9 flex items-center justify-center rounded-xl 
                       text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
      {icon}
      {badge && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 
                         text-white text-[9px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}
```

---

## 4. Page Header

```jsx
// On mobile: title + subtitle stacked full width, actions wrap below.
// On sm+: title left, actions right on same row.
function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}

// Usage:
<PageHeader
  title="Dashboard"
  subtitle="Plan, prioritize, and accomplish your tasks with ease."
  actions={<>
    <Button variant="outline" size="sm" icon={<Upload size={14}/>}>Import</Button>
    <Button variant="primary" icon={<Plus size={15}/>}>Add Project</Button>
  </>}
/>
```

---

## 5. Buttons

```jsx
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
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// Icon-only button
function IconButton({ icon, onClick, variant = "ghost", size = "md", title }) {
  const sizes = { sm: "w-7 h-7", md: "w-9 h-9", lg: "w-11 h-11" };
  return (
    <button title={title} onClick={onClick}
      className={`${sizes[size]} flex items-center justify-center rounded-xl transition-all
        ${variant === "ghost" ? "text-gray-500 hover:bg-gray-100" : "bg-[#1a472a] text-white hover:bg-[#2d6a4f]"}`}>
      {icon}
    </button>
  );
}
```

---

## 6. Avatar

```jsx
const AVATAR_COLORS = [
  "bg-purple-100 text-purple-700", "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",   "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",     "bg-orange-100 text-orange-700",
];

function Avatar({ name, src, size = "md", online }) {
  const sizes = { xs: "w-6 h-6 text-[9px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const colorIdx = name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0;
  return (
    <div className="relative inline-flex flex-shrink-0">
      <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold overflow-hidden
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

// Avatar group (stacked)
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
```

---

## 7. Badge / Tag / Status Pill

```jsx
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
    completed: "bg-[#052e16]", progress: "bg-amber-500",
    pending: "bg-red-500", info: "bg-blue-500", default: "bg-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />}
      {children}
    </span>
  );
}
```

---

## 8. Stat / KPI Cards

```jsx
// Hero card (dark green) or regular card
function StatCard({ label, value, trend, trendLabel, hero, linkTo }) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  return (
    <div className={`relative rounded-2xl p-5 shadow-sm ${hero ? "bg-[#1a472a] text-white" : "bg-white text-gray-900"}`}>
      <button className={`absolute top-4 right-4 w-7 h-7 rounded-full border flex items-center justify-center
                          transition-colors hover:scale-110
                          ${hero ? "border-white/30 hover:bg-white/10" : "border-gray-200 hover:bg-gray-50"}`}>
        <ArrowUpRight size={13} />
      </button>
      <p className={`text-sm font-semibold ${hero ? "text-white/80" : "text-gray-600"}`}>{label}</p>
      <p className="text-4xl font-bold mt-2 mb-3 leading-none">{value}</p>
      {trend && (
        <div className={`flex items-center gap-1.5 text-xs ${hero ? "text-white/60" : "text-gray-400"}`}>
          <TrendIcon size={13} />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

// Usage: responsive 4-up grid
// Mobile: 1 col → sm: 2 cols → xl: 4 cols
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
  <StatCard label="Total Projects" value="24" trend="up" trendLabel="Increased from last month" hero />
  <StatCard label="Ended Projects" value="10" trend="up" trendLabel="Increased from last month" />
  <StatCard label="Running Projects" value="12" trend="up" trendLabel="Increased from last month" />
  <StatCard label="Pending Project" value="2" trendLabel="On Discuss" />
</div>
```

---

## 9. Cards (generic containers)

```jsx
function Card({ title, headerAction, children, className = "", padding = true }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-50 ${padding ? "p-5" : ""} ${className}`}>
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

// Dark card variant (for time tracker, etc.)
function DarkCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl p-5 bg-[#0d2818] text-white ${className}`}
         style={{ backgroundImage: "radial-gradient(ellipse at top right, #1a472a 0%, #0d2818 70%)" }}>
      {title && <p className="text-sm font-semibold text-white/60 mb-3">{title}</p>}
      {children}
    </div>
  );
}
```

---

## 10. Data Table

Tables scroll horizontally on narrow screens. Add `hideOnMobile: true` to columns that should collapse on small screens. On very small screens, use `MobileTableCard` instead of a table.

```jsx
function DataTable({ columns, data, onRowClick, selectable, actions }) {
  const bp = useBreakpoint();
  const [selected, setSelected] = useState([]);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const toggleRow = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === data.length ? [] : data.map(r => r.id));

  const sorted = sortCol
    ? [...data].sort((a, b) => {
        const v = a[sortCol] < b[sortCol] ? -1 : 1;
        return sortDir === "asc" ? v : -v;
      })
    : data;

  const handleSort = (key) => {
    if (sortCol === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(key); setSortDir("asc"); }
  };

  // On mobile, show card list instead of table
  if (bp === "mobile") {
    return (
      <div className="space-y-2">
        {selected.length > 0 && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#d8f3dc] text-[#1a472a]">
            <span className="text-sm font-medium">{selected.length} selected</span>
            <Button size="xs" variant="danger" icon={<Trash2 size={12}/>}>Delete</Button>
          </div>
        )}
        {sorted.map(row => (
          <MobileTableCard key={row.id} row={row} columns={columns}
            selected={selectable && selected.includes(row.id)}
            onSelect={selectable ? () => toggleRow(row.id) : undefined}
            onClick={() => onRowClick?.(row)}
            actions={actions?.(row)} />
        ))}
        {data.length === 0 && <EmptyState icon={<Search size={32}/>} title="No results found" />}
      </div>
    );
  }

  // Tablet/desktop: horizontal-scroll table, hide low-priority columns on tablet
  const visibleCols = bp === "tablet"
    ? columns.filter(c => !c.hideOnTablet)
    : columns;

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 mb-2 rounded-xl bg-[#d8f3dc] text-[#1a472a]">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <Button size="xs" variant="danger" icon={<Trash2 size={12}/>}>Delete</Button>
          <Button size="xs" variant="outline">Export</Button>
        </div>
      )}
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="border-b border-gray-100">
            {selectable && (
              <th className="w-10 px-3 py-3">
                <input type="checkbox" checked={selected.length === data.length}
                  onChange={toggleAll} className="rounded accent-[#1a472a]"/>
              </th>
            )}
            {visibleCols.map(col => (
              <th key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={`px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide
                  ${col.sortable !== false ? "cursor-pointer hover:text-gray-800 select-none" : ""}`}>
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortCol === col.key && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                </span>
              </th>
            ))}
            {actions && <th className="px-3 py-3 w-14" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {sorted.map((row) => (
            <tr key={row.id}
              onClick={() => onRowClick?.(row)}
              className={`group transition-colors ${onRowClick ? "cursor-pointer" : ""}
                hover:bg-[#f4f6f4] ${selected.includes(row.id) ? "bg-[#f0fdf4]" : ""}`}>
              {selectable && (
                <td className="px-3 py-3" onClick={e => { e.stopPropagation(); toggleRow(row.id); }}>
                  <input type="checkbox" checked={selected.includes(row.id)}
                    onChange={() => {}} className="rounded accent-[#1a472a]"/>
                </td>
              )}
              {visibleCols.map(col => (
                <td key={col.key} className="px-3 md:px-4 py-3 text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-3 py-3">
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
  );
}

// Mobile card — replaces a table row on small screens
function MobileTableCard({ row, columns, selected, onSelect, onClick, actions }) {
  const primary = columns[0];
  const rest = columns.slice(1);
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 shadow-sm border transition-colors
        ${selected ? "border-[#52b788] bg-[#f0fdf4]" : "border-gray-100"}
        ${onClick ? "cursor-pointer active:bg-gray-50" : ""}`}
    >
      <div className="flex items-start gap-3">
        {onSelect && (
          <input type="checkbox" checked={selected} onChange={onSelect}
            className="mt-1 rounded accent-[#1a472a] flex-shrink-0" onClick={e => e.stopPropagation()} />
        )}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Primary field — large */}
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-gray-900 text-sm truncate">
              {primary.render ? primary.render(row[primary.key], row) : row[primary.key]}
            </span>
            {actions && <div className="flex items-center gap-1 flex-shrink-0">{actions}</div>}
          </div>
          {/* Secondary fields — 2-col grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {rest.map(col => (
              <div key={col.key}>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-0.5">{col.label}</p>
                <div className="text-xs text-gray-700">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Column definition with responsive hints:
const columns = [
  { key: "name",     label: "Project",  render: (v) => <span className="font-medium text-gray-900">{v}</span> },
  { key: "status",   label: "Status",   render: (v) => <Badge variant={v}>{v}</Badge> },
  { key: "due",      label: "Due Date", hideOnTablet: true },   // ← hidden on tablet
  { key: "assignee", label: "Assignee", render: (v) => <Avatar name={v} size="sm" />, hideOnTablet: true },
  { key: "progress", label: "Progress", render: (v) => <ProgressBar value={v} /> },
];
```

---

## 11. Lists

### Activity List
```jsx
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
```

### Project / Task List
```jsx
function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  return (
    <ul className="space-y-2">
      {tasks.map(task => (
        <li key={task.id}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-colors">
          <button onClick={() => onToggle?.(task.id)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
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
  );
}
```

### Notification List
```jsx
function NotificationList({ items, onMarkRead }) {
  return (
    <ul className="divide-y divide-gray-50">
      {items.map(n => (
        <li key={n.id} className={`flex gap-3 p-4 ${n.unread ? "bg-[#f0fdf4]" : ""}`}>
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
    </ul>
  );
}
```

---

## 12. Charts (SVG, no library needed)

### Pill Bar Chart (Donezo signature)
```jsx
function PillBarChart({ data, height = 160 }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const pct = d.value / max;
        const barH = Math.max(pct * (height - 32), 12);
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            {d.label2 && <span className="text-[10px] text-gray-500">{d.label2}</span>}
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
```

### Line / Area Chart (SVG)
```jsx
function LineChart({ data, width = 400, height = 120, color = "#1a472a" }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const xStep = width / (data.length - 1);
  const yScale = (v) => height - ((v - min) / (max - min || 1)) * (height * 0.8) - height * 0.1;
  const points = data.map((d, i) => `${i * xStep},${yScale(d.value)}`).join(" ");
  const areaPoints = `0,${height} ${points} ${(data.length - 1) * xStep},${height}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
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
```

### Donut / Ring Chart (SVG)
```jsx
function DonutChart({ segments, size = 140, thickness = 20 }) {
  // segments: [{ value, color, label }]
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circumference;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={-offset} strokeLinecap="round"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// Wrapped with center label
function DonutWithLabel({ value, label, segments }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <DonutChart segments={segments} />
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
```

### Progress Bar
```jsx
function ProgressBar({ value, max = 100, color = "#1a472a", showLabel = false, size = "md" }) {
  const pct = Math.round((value / max) * 100);
  const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" };
  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${heights[size]} rounded-full bg-gray-100 overflow-hidden`}>
        <div className={`${heights[size]} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%`, background: color }} />
      </div>
      {showLabel && <span className="text-xs text-gray-500 font-medium w-8 text-right">{pct}%</span>}
    </div>
  );
}
```

---

## 13. Modal / Dialog

On mobile, modals slide up as a **bottom sheet** with a drag handle. On tablet/desktop they center as a floating dialog.

```jsx
function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const bp = useBreakpoint();

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl", full: "max-w-full mx-4" };

  // Mobile: bottom sheet
  if (bp === "mobile") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh]"
          style={{ animation: "slideUp 0.3s ease-out" }}>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="px-5 py-4 border-t border-gray-100 pb-safe flex flex-col gap-2">
              {footer}
            </div>
          )}
        </div>
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      </div>
    );
  }

  // Tablet / Desktop: centered dialog
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400
                       hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Confirm dialog — uses Modal, footer buttons go full-width on mobile
function ConfirmDialog({ open, onClose, onConfirm, title, message, danger }) {
  const bp = useBreakpoint();
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        bp === "mobile" ? (
          <div className="flex flex-col gap-2 w-full">
            <Button variant={danger ? "danger" : "primary"} className="w-full" onClick={onConfirm}>Confirm</Button>
            <Button variant="outline" className="w-full" onClick={onClose}>Cancel</Button>
          </div>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>Confirm</Button>
          </>
        )
      }>
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
}
```

---

## 14. Dropdown Menu

On mobile, dropdowns anchored to the topbar open as near-full-width panels below the header.

```jsx
function Dropdown({ trigger, items, mobileFullWidth = false }) {
  const [open, setOpen] = useState(false);
  const bp = useBreakpoint();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isMobileWide = bp === "mobile" && mobileFullWidth;

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(p => !p)}>{trigger}</div>
      {open && (
        <div className={`
          bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50
          ${isMobileWide
            ? "fixed left-2 right-2 top-14"
            : "absolute right-0 mt-1.5 w-48"}
        `}>
          {items.map((item, i) =>
            item.divider ? (
              <div key={i} className="my-1 border-t border-gray-100" />
            ) : (
              <button key={i}
                onClick={() => { item.onClick?.(); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 sm:py-2 text-sm transition-colors
                  ${item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-[#f4f6f4]"}`}>
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
```

---

## 15. Form Controls

```jsx
// Text input
function Input({ label, id, error, hint, icon, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
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

// Select
function Select({ label, id, options, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
      <select id={id} {...props}
        className={`w-full rounded-xl border text-sm px-3 py-2.5 bg-white outline-none transition-all
          ${error ? "border-red-300" : "border-gray-200 focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788]"}`}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// Textarea
function Textarea({ label, id, error, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea id={id} rows={4} {...props}
        className={`w-full rounded-xl border text-sm px-3 py-2.5 outline-none resize-none transition-all
          ${error ? "border-red-300" : "border-gray-200 focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788]"}`} />
    </div>
  );
}

// Toggle switch
function Toggle({ label, checked, onChange, description }) {
  return (
    <div className="flex items-start gap-3">
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors mt-0.5
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

// Form section wrapper — stacks on mobile, 3-col grid on md+
function FormSection({ title, description, children }) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 py-5 border-b border-gray-100">
      <div>
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );
}
```

---

## 16. Tabs

Pill tabs compress to a scrollable row on mobile. Underline tabs always scroll.

```jsx
function Tabs({ tabs, activeTab, onChange }) {
  return (
    // overflow-x-auto + no-scrollbar lets tabs scroll horizontally on mobile
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl min-w-max sm:min-w-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg
                        text-xs sm:text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"}`}>
            {tab.icon && tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === tab.id ? "bg-[#d8f3dc] text-[#1a472a]" : "bg-gray-200 text-gray-500"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Underline tabs — always scrollable
function UnderlineTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="flex gap-4 sm:gap-6 border-b border-gray-100 min-w-max sm:min-w-0">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className={`pb-3 text-xs sm:text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap
              ${activeTab === tab.id
                ? "border-[#1a472a] text-[#1a472a]"
                : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## 17. Toast / Snackbar

```jsx
// Toast hook
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), toast.duration || 4000);
  };
  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, toast: add, remove };
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm
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
```

---

## 18. Settings Page + Settings Sidebar

On mobile, the settings sidebar collapses to a `<select>` dropdown at the top. On tablet+, the two-panel layout is restored.

```jsx
const SETTINGS_SECTIONS = [
  { id: "general",       label: "General",        icon: Settings },
  { id: "profile",       label: "Profile",         icon: User },
  { id: "notifications", label: "Notifications",   icon: Bell },
  { id: "appearance",    label: "Appearance",      icon: Sun },
  { id: "security",      label: "Security",        icon: Shield },
  { id: "billing",       label: "Billing",         icon: CreditCard },
  { id: "team",          label: "Team & Members",  icon: Users },
  { id: "integrations",  label: "Integrations",    icon: Zap },
];

function SettingsPage() {
  const [section, setSection] = useState("profile");
  const bp = useBreakpoint();

  return (
    <div className={bp === "mobile" ? "flex flex-col gap-4" : "flex gap-6 h-full"}>

      {/* Mobile: dropdown selector */}
      {bp === "mobile" && (
        <div className="relative">
          <select
            value={section}
            onChange={e => setSection(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl
                       px-4 py-3 pr-10 text-sm font-medium text-gray-800 outline-none
                       focus:ring-2 focus:ring-[#d8f3dc] focus:border-[#52b788]"
          >
            {SETTINGS_SECTIONS.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      )}

      {/* Tablet/Desktop: sidebar nav */}
      {bp !== "mobile" && (
        <aside className="w-48 lg:w-56 flex-shrink-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 px-3">Settings</p>
          <nav className="space-y-0.5">
            {SETTINGS_SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
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
      )}

      {/* Content panel */}
      <div className="flex-1 bg-white rounded-2xl p-4 sm:p-6 shadow-sm overflow-y-auto min-w-0">
        {section === "profile"       && <ProfileSettings />}
        {section === "general"       && <GeneralSettings />}
        {section === "notifications" && <NotificationSettings />}
      </div>
    </div>
  );
}
```

---

## 19. Profile Page / Profile Settings Panel

```jsx
function ProfileSettings() {
  const [name, setName] = useState("Totok Michael");
  const [email, setEmail] = useState("tmichael20@mail.com");
  const [bio, setBio] = useState("");

  return (
    <div className="space-y-0 divide-y divide-gray-100">
      <div className="pb-6">
        <h2 className="text-lg font-bold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
      </div>

      {/* Avatar section */}
      <FormSection title="Photo" description="Update your profile photo">
        <div className="flex items-center gap-4">
          <Avatar name={name} size="lg" />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" icon={<Upload size={14}/>}>Upload</Button>
            <Button size="sm" variant="ghost" icon={<Trash2 size={14}/>}>Remove</Button>
          </div>
        </div>
      </FormSection>

      {/* Basic info */}
      <FormSection title="Basic Info" description="Your name and public display">
        <Input label="Full name" value={name} onChange={e => setName(e.target.value)} />
        <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
        <Textarea label="Bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell your team about yourself..." />
      </FormSection>

      {/* Timezone / Language */}
      <FormSection title="Preferences" description="Regional settings">
        <Select label="Timezone" options={[
          { value: "utc", label: "UTC" },
          { value: "asia/colombo", label: "Asia/Colombo (UTC+5:30)" },
        ]} />
        <Select label="Language" options={[{ value: "en", label: "English" }]} />
      </FormSection>

      <div className="pt-6 flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Save Changes</Button>
      </div>
    </div>
  );
}
```

---

## 20. Time Tracker Widget

```jsx
function TimeTrackerWidget() {
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
        <button onClick={() => setRunning(p => !p)}
          className="w-11 h-11 rounded-full bg-white text-gray-800 flex items-center justify-center hover:scale-105 transition-transform shadow">
          {running ? <Pause size={18}/> : <Play size={18}/>}
        </button>
        <button onClick={() => { setSeconds(0); setRunning(false); }}
          className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow">
          <Square size={18}/>
        </button>
      </div>
    </DarkCard>
  );
}
```

---

## 21. Reminder / Event Card

```jsx
function ReminderCard({ title, time, onStart }) {
  return (
    <Card>
      <p className="text-xs text-gray-400 mb-1">Upcoming</p>
      <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-5">Time: {time}</p>
      <button onClick={onStart}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                   bg-[#1a472a] text-white font-semibold hover:bg-[#2d6a4f] transition-colors">
        <Video size={16}/> Start Meeting
      </button>
    </Card>
  );
}
```

---

## 22. Empty State

```jsx
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
  );
}
```

---

## 23. Skeleton Loaders

Skeletons match the exact shape of the component they replace. Always prefer skeletons over spinners for content areas — they reduce perceived wait time by showing layout before data arrives.

### Base Skeleton Primitive
```jsx
// Shimmer animation — add to your global CSS or tailwind config:
// @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
// .skeleton { animation: shimmer 1.6s ease-in-out infinite; background: linear-gradient(90deg, #f0f0f0 25%, #e0e7e0 50%, #f0f0f0 75%); background-size: 800px 100%; }

// Base atom — use everywhere
function Skeleton({ className = "", circle = false }) {
  return (
    <div
      className={`${circle ? "rounded-full" : "rounded-xl"} ${className}`}
      style={{
        background: "linear-gradient(90deg, #f0f2f0 25%, #e4eae4 50%, #f0f2f0 75%)",
        backgroundSize: "800px 100%",
        animation: "skshimmer 1.6s ease-in-out infinite",
      }}
    />
  );
}

// Inject keyframes once into document head (call in app root)
function injectSkeletonKeyframes() {
  if (document.getElementById("sk-keyframes")) return;
  const style = document.createElement("style");
  style.id = "sk-keyframes";
  style.textContent = `@keyframes skshimmer{0%{background-position:-800px 0}100%{background-position:800px 0}}`;
  document.head.appendChild(style);
}
```

### Stat Card Skeleton (matches StatCard)
```jsx
function StatCardSkeleton({ hero = false }) {
  return (
    <div className={`rounded-2xl p-5 space-y-3 ${hero ? "bg-[#1a472a]/10" : "bg-white"}`}>
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

// 4-up stat row skeleton
function StatRowSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCardSkeleton hero />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}
```

### Table Skeleton (matches DataTable)
```jsx
// widths: array of % strings per column, e.g. ["40%","20%","20%","20%"]
function TableSkeleton({ rows = 5, cols = 4, widths }) {
  const defaultWidths = Array.from({ length: cols }, (_, i) =>
    i === 0 ? "55%" : `${30 + Math.floor(i * 13)}%`
  );
  const w = widths || defaultWidths;
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
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
```

### Card Skeleton (generic)
```jsx
function CardSkeleton({ lines = 3, hasHeader = true, hasChart = false, height }) {
  return (
    <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm" style={height ? { height } : {}}>
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
```

### List Item Skeleton (matches ActivityList / TaskList)
```jsx
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
```

### Sidebar Skeleton
```jsx
function SidebarSkeleton({ collapsed = false }) {
  return (
    <aside className={`flex flex-col bg-white border-r border-gray-100 py-5 ${collapsed ? "w-[72px] px-3" : "w-[260px] px-4"}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 mb-6 ${collapsed ? "justify-center" : ""}`}>
        <Skeleton circle className="w-8 h-8" />
        {!collapsed && <Skeleton className="h-4 w-20" />}
      </div>
      {/* Nav items */}
      {!collapsed && <Skeleton className="h-2.5 w-12 mb-3" />}
      <div className="space-y-1.5">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${collapsed ? "justify-center" : ""}`}>
            <Skeleton circle className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <Skeleton className="h-3.5 flex-1" />}
          </div>
        ))}
      </div>
    </aside>
  );
}
```

### Chart Skeleton (Pill Bar Chart)
```jsx
function PillBarChartSkeleton({ bars = 7, height = 160 }) {
  const heights = [0.45, 0.7, 0.9, 0.6, 0.5, 0.3, 0.55];
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
          <div className="relative w-full flex justify-center" style={{ height: height - 24 }}>
            <Skeleton
              className="absolute bottom-0 w-full max-w-[36px]"
              style={{ height: `${Math.max((heights[i % heights.length]) * (height - 24), 20)}px`, borderRadius: 999 }}
            />
          </div>
          <Skeleton className="h-2.5 w-4" />
        </div>
      ))}
    </div>
  );
}
```

### TopBar Skeleton
```jsx
function TopBarSkeleton() {
  return (
    <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-100">
      <Skeleton className="h-9 flex-1 max-w-md rounded-xl" />
      <div className="flex items-center gap-2 ml-auto">
        <Skeleton circle className="w-9 h-9" />
        <Skeleton circle className="w-9 h-9" />
        <div className="flex items-center gap-2.5 pl-2">
          <Skeleton circle className="w-9 h-9" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-32" />
          </div>
        </div>
      </div>
    </header>
  );
}
```

### Profile Settings Skeleton
```jsx
function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-6 divide-y divide-gray-100">
      <div className="pb-4 space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-56" />
      </div>
      {/* Avatar row */}
      <div className="py-5 grid grid-cols-3 gap-6">
        <Skeleton className="h-3.5 w-16" />
        <div className="col-span-2 flex items-center gap-4">
          <Skeleton circle className="w-12 h-12" />
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
      {/* Fields */}
      {[1, 2].map(i => (
        <div key={i} className="py-5 grid grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-2.5 w-32" />
          </div>
          <div className="col-span-2 space-y-3">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Full Dashboard Page Skeleton (initial load)
```jsx
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
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <CardSkeleton hasHeader hasChart height={220} />
        </div>
        <CardSkeleton hasHeader lines={1} height={220} />
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-24 rounded-xl" />
          </div>
          <ListItemSkeleton count={4} />
        </div>
        <CardSkeleton hasHeader lines={0} hasChart height={200} />
        <div className="rounded-2xl p-5 bg-[#0d2818]/20 space-y-4">
          <Skeleton className="h-3.5 w-24" style={{ background: "rgba(255,255,255,0.15)" }} />
          <Skeleton className="h-12 w-36 mx-auto rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex justify-center gap-3">
            <Skeleton circle className="w-11 h-11" style={{ background: "rgba(255,255,255,0.15)" }} />
            <Skeleton circle className="w-11 h-11" style={{ background: "rgba(255,255,255,0.15)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Usage Pattern — swap skeleton ↔ content
```jsx
function DashboardPage() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchDashboardData().then(() => setLoading(false));
  }, []);

  if (loading) return <DashboardPageSkeleton />;
  return <ActualDashboardContent />;
}

// Or for individual cards with staggered reveal:
function AnalyticsCard({ isLoading, data }) {
  if (isLoading) return <CardSkeleton hasHeader hasChart height={220} />;
  return <Card title="Project Analytics">...</Card>;
}
```

---

## 29. Global Loading Animations

Use these for: page transitions, button submit states, data refetching, file uploads, and app-wide navigation.

### A. Full-Page Splash / App Init Loader
```jsx
// Shown on first app load before shell renders
function SplashLoader() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[200]">
      <DonezoLogo />
      <p className="mt-4 text-lg font-bold text-gray-900">Donezo</p>
      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#1a472a]"
            style={{ animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}`}</style>
    </div>
  );
}
```

### B. Top Progress Bar (navigation / page transitions)
```jsx
// Mount on route change, unmount when done. Inspired by NProgress/YouTube bar.
function TopProgressBar({ loading }) {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setWidth(0);
      // Fake progress: rush to 80%, then wait
      const t1 = setTimeout(() => setWidth(30), 50);
      const t2 = setTimeout(() => setWidth(60), 300);
      const t3 = setTimeout(() => setWidth(80), 700);
      return () => [t1, t2, t3].forEach(clearTimeout);
    } else {
      // Complete
      setWidth(100);
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (!visible) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[300] h-0.5 bg-transparent pointer-events-none">
      <div
        className="h-full bg-[#52b788] transition-all"
        style={{
          width: `${width}%`,
          transitionDuration: width === 100 ? "200ms" : "600ms",
          transitionTimingFunction: "ease-out",
          boxShadow: "0 0 8px 1px #52b788",
        }}
      />
    </div>
  );
}

// Usage in AppShell:
// <TopProgressBar loading={isNavigating} />
```

### C. Button Loading State
```jsx
function LoadingButton({ loading, children, loadingText, ...props }) {
  return (
    <Button {...props} disabled={loading}>
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          {loadingText || "Loading..."}
        </>
      ) : children}
    </Button>
  );
}

// Usage:
<LoadingButton variant="primary" loading={isSaving} loadingText="Saving...">
  Save Changes
</LoadingButton>
```

### D. Inline Spinner (small, for icon slots or table cells)
```jsx
function Spinner({ size = "md", color = "#1a472a" }) {
  const sizes = { xs: 12, sm: 16, md: 20, lg: 28, xl: 36 };
  const px = sizes[size];
  return (
    <svg
      width={px} height={px}
      viewBox="0 0 24 24" fill="none"
      className="animate-spin flex-shrink-0"
      style={{ color }}
    >
      <circle className="opacity-20" cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="3.5" />
      <path className="opacity-90" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
```

### E. Card / Section Overlay Loader
```jsx
// Overlays an existing card while it refetches — doesn't replace it with skeleton
function LoadingOverlay({ loading, children }) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl 
                        flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="lg" />
            <p className="text-xs font-medium text-gray-500">Refreshing...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Usage:
<LoadingOverlay loading={isRefetching}>
  <Card title="Project Analytics">...</Card>
</LoadingOverlay>
```

### F. Pulsing Dot (live / real-time indicator)
```jsx
function LiveDot({ label = "Live" }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52b788] opacity-60" />
        <span className="relative inline-flex w-2 h-2 rounded-full bg-[#1a472a]" />
      </span>
      <span className="text-xs font-medium text-[#1a472a]">{label}</span>
    </div>
  );
}
```

### G. Page Transition Fade (between routes)
```jsx
// Wrap page content — fades in on mount
function PageFade({ children, key: pageKey }) {
  return (
    <div
      key={pageKey}
      style={{ animation: "pageFadeIn 0.25s ease-out both" }}
    >
      {children}
      <style>{`@keyframes pageFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// Usage: wrap each page/view with PageFade and pass the route as key
// <PageFade key={currentRoute}><DashboardPage /></PageFade>
```

### H. Full-Screen Route Loading (lazy-loaded pages)
```jsx
// Used when React.lazy() is loading a chunk
function RouteLoader() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#f4f6f4] gap-4">
      <div className="w-12 h-12 rounded-2xl bg-[#d8f3dc] flex items-center justify-center">
        <Spinner size="md" />
      </div>
      <p className="text-sm text-gray-500 font-medium">Loading page...</p>
    </div>
  );
}

// Usage with React.lazy:
// const AnalyticsPage = React.lazy(() => import("./AnalyticsPage"));
// <Suspense fallback={<RouteLoader />}><AnalyticsPage /></Suspense>
```

### I. Upload / File Progress Bar
```jsx
function UploadProgress({ progress, filename }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#f0fdf4] border border-[#d8f3dc] rounded-xl">
      <div className="w-8 h-8 rounded-lg bg-[#d8f3dc] flex items-center justify-center flex-shrink-0">
        <Upload size={15} className="text-[#1a472a]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{filename}</p>
        <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#1a472a] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="text-xs font-semibold text-[#1a472a] flex-shrink-0">{progress}%</span>
    </div>
  );
}
```

### Loading State Decision Guide
```
Initial page/app load       → SplashLoader (full screen)
Route / page navigation     → TopProgressBar (subtle top strip)
First data fetch for a view → skeleton that matches content shape
Refetching existing data    → LoadingOverlay (preserve layout)
Button action (save/submit) → LoadingButton (inline spinner)
Lazy-loaded route chunk     → RouteLoader (centered minimal)
Real-time connected status  → LiveDot
File upload                 → UploadProgress
Tiny inline wait            → Spinner (xs/sm)
```

---

## 24. Pagination

```jsx
function Pagination({ page, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                   hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronLeft size={15}/>
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
            ${p === page ? "bg-[#1a472a] text-white" : "text-gray-600 hover:bg-gray-100"}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
                   hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={15}/>
      </button>
    </div>
  );
}
```

---

## 25. Search + Filter Bar

```jsx
function SearchFilterBar({ onSearch, filters, activeFilters, onFilterChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 flex-1 min-w-[200px]">
        <Search size={15} className="text-gray-400" />
        <input placeholder="Search..." onChange={e => onSearch(e.target.value)}
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" />
      </div>
      {filters?.map(f => (
        <button key={f.id} onClick={() => onFilterChange(f.id)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all
            ${activeFilters?.includes(f.id)
              ? "bg-[#1a472a] text-white border-[#1a472a]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#52b788]"}`}>
          {f.icon} {f.label}
        </button>
      ))}
      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
        <Filter size={14}/> Filters
      </button>
      <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
        <Download size={14}/> Export
      </button>
    </div>
  );
}
```

---

## 26. Notification Bell Popover

```jsx
function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([/* ... NotificationList items */]);
  const unread = items.filter(n => n.unread).length;
  return (
    <div className="relative">
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
            <button className="text-xs text-[#1a472a] font-medium hover:underline">Mark all read</button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <NotificationList items={items} />
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <button className="w-full text-center text-sm text-[#1a472a] font-medium hover:underline">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 27. User Profile Popover (Top Bar)

```jsx
function UserMenu({ user, onNavigate, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-50">
          <Avatar name={user.name} size="sm" online />
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 leading-none">{user.name}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{user.email}</p>
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
  );
}
```

---

## 28. General Settings Panel

```jsx
function GeneralSettings() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  return (
    <div className="space-y-0 divide-y divide-gray-100">
      <div className="pb-6">
        <h2 className="text-lg font-bold text-gray-900">General</h2>
        <p className="text-sm text-gray-500 mt-1">Workspace-wide preferences</p>
      </div>
      <FormSection title="Appearance" description="Visual preferences">
        <Toggle label="Dark Mode" checked={darkMode} onChange={setDarkMode}
          description="Switch between light and dark interface" />
      </FormSection>
      <FormSection title="Notifications" description="How you want to be notified">
        <Toggle label="Email notifications" checked={emailNotifs} onChange={setEmailNotifs} />
        <Toggle label="Slack notifications" checked={slackNotifs} onChange={setSlackNotifs} />
      </FormSection>
      <div className="pt-6 flex justify-end">
        <Button variant="primary">Save Changes</Button>
      </div>
    </div>
  );
}
```

---

---

## 30. Responsive Design System

### Breakpoint Reference
```
xs:  < 480px   — very small phones (iPhone SE)
sm:  480–767px — phones, large phones
md:  768–1023px — tablets, iPad
lg:  1024–1279px — small laptops, iPad Pro landscape
xl:  1280–1535px — desktop
2xl: ≥ 1536px  — wide desktop / external monitors
```

Tailwind prefixes map directly: `sm:` `md:` `lg:` `xl:` `2xl:`.  
**Build mobile-first**: write the mobile class first, then add responsive overrides.

---

### Responsive Grid System

Every multi-column layout uses this pattern — single column on mobile, expanding as screen grows:

```jsx
// Stat cards: 1 col → 2 col → 4 col
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
  <StatCard hero ... />
  <StatCard ... />
  <StatCard ... />
  <StatCard ... />
</div>

// Mid content row: stack on mobile, 2-col tablet, 3-col desktop
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
  <div className="md:col-span-2 xl:col-span-1 xl:col-span-2"> {/* chart — wider */}
    <Card title="Project Analytics">...</Card>
  </div>
  <Card title="Reminders">...</Card>
  <Card title="Project">...</Card>
</div>

// Bottom row: stack → 2-col → 3-col
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
  <Card title="Team Collaboration">...</Card>
  <Card title="Project Progress">...</Card>
  <TimeTrackerWidget />
</div>
```

---

### Responsive Page Header

```jsx
function PageHeader({ title, subtitle, actions }) {
  return (
    // Stack on mobile, side-by-side on sm+
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && (
        // Wrap buttons on mobile, row on sm+
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:flex-nowrap">
          {actions}
        </div>
      )}
    </div>
  );
}
```

---

### Responsive Data Table

On mobile, horizontal scroll is added and non-essential columns are hidden:

```jsx
function DataTable({ columns, data, ...rest }) {
  return (
    <div>
      {/* Horizontal scroll wrapper for narrow screens */}
      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
        <table className="w-full text-sm min-w-[600px]"> {/* min-w forces scroll before columns collapse */}
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map(col => (
                <th key={col.key}
                  className={`px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide
                    ${col.hideOnMobile ? "hidden md:table-cell" : ""}
                    ${col.hideOnTablet ? "hidden lg:table-cell" : ""}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(row => (
              <tr key={row.id} className="hover:bg-[#f4f6f4] transition-colors">
                {columns.map(col => (
                  <td key={col.key}
                    className={`px-3 md:px-4 py-3 text-gray-700
                      ${col.hideOnMobile ? "hidden md:table-cell" : ""}
                      ${col.hideOnTablet ? "hidden lg:table-cell" : ""}`}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — shown instead of table on xs */}
      <div className="sm:hidden space-y-2 mt-2">
        {data.map(row => (
          <MobileTableCard key={row.id} row={row} columns={columns} />
        ))}
      </div>
    </div>
  );
}

// Fallback card layout for each table row on xs screens
function MobileTableCard({ row, columns }) {
  const primary = columns[0];
  const rest = columns.slice(1).filter(c => !c.hideOnMobile);
  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
      <div className="font-semibold text-sm text-gray-900">
        {primary.render ? primary.render(row[primary.key], row) : row[primary.key]}
      </div>
      <div className="flex flex-wrap gap-2">
        {rest.map(col => (
          <div key={col.key} className="text-xs text-gray-500">
            <span className="font-medium text-gray-600">{col.label}: </span>
            {col.render ? col.render(row[col.key], row) : row[col.key]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Responsive Modal

```jsx
function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  if (!open) return null;

  const widths = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`
        relative bg-white w-full ${widths[size]}
        rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col
        max-h-[90vh] sm:max-h-[85vh]
      `}>
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
// On mobile: slides up from bottom as a bottom sheet (rounded top corners, drag handle, full-width footer buttons)
// On sm+: centered dialog as normal
```

---

### Responsive Settings Page

```jsx
function SettingsPage() {
  const [section, setSection] = useState("profile");
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentSection = SETTINGS_SECTIONS.find(s => s.id === section);

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full">

      {/* Mobile: section selector button */}
      <div className="md:hidden">
        <button onClick={() => setMobileOpen(p => !p)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm font-medium">
          <span className="flex items-center gap-2">
            {currentSection && <currentSection.icon size={15} />}
            {currentSection?.label}
          </span>
          <ChevronDown size={15} className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
        {mobileOpen && (
          <div className="mt-1 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md">
            {SETTINGS_SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => { setSection(s.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-gray-50 last:border-0
                    ${section === s.id ? "bg-[#d8f3dc] text-[#1a472a]" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Icon size={15} /> {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Desktop/tablet: sidebar */}
      <aside className="hidden md:block w-52 lg:w-56 flex-shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3 px-3">Settings</p>
        <nav className="space-y-0.5">
          {SETTINGS_SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${section === s.id ? "bg-[#d8f3dc] text-[#1a472a]" : "text-gray-500 hover:bg-gray-100"}`}>
                <Icon size={16} className="flex-shrink-0" /> {s.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content panel */}
      <div className="flex-1 bg-white rounded-2xl p-4 sm:p-6 shadow-sm overflow-y-auto min-w-0">
        {section === "profile"  && <ProfileSettings />}
        {section === "general"  && <GeneralSettings />}
        {section === "notifications" && <NotificationSettings />}
      </div>
    </div>
  );
}
```

---

### Responsive Form Section

```jsx
// FormSection: stacks on mobile, 3-col grid on md+
function FormSection({ title, description, children }) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-6 py-5 border-b border-gray-100">
      <div>
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );
}
```

---

### Responsive Tabs

```jsx
// On mobile: scrollable horizontal tab strip. On desktop: full-width pills or underline.
function Tabs({ tabs, activeTab, onChange, variant = "pill" }) {
  return (
    // overflow-x-auto lets tabs scroll on mobile without wrapping
    <div className="overflow-x-auto -mx-1 px-1">
      <div className={`flex min-w-max ${variant === "pill" ? "gap-1 p-1 bg-gray-100 rounded-xl" : "gap-4 border-b border-gray-100"}`}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-3 sm:px-4 py-2 whitespace-nowrap text-sm font-medium transition-all
              ${variant === "pill"
                ? `rounded-lg ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`
                : `border-b-2 -mb-px ${activeTab === tab.id ? "border-[#1a472a] text-[#1a472a]" : "border-transparent text-gray-500 hover:text-gray-700"}`
              }
            `}>
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === tab.id ? "bg-[#d8f3dc] text-[#1a472a]" : "bg-gray-200 text-gray-500"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### Responsive Cards — Fluid Typography & Spacing

```jsx
// StatCard with responsive text sizes
function StatCard({ label, value, trend, trendLabel, hero }) {
  return (
    <div className={`relative rounded-2xl p-4 sm:p-5 shadow-sm ${hero ? "bg-[#1a472a] text-white" : "bg-white text-gray-900"}`}>
      <button className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full border
                          flex items-center justify-center transition-colors hover:scale-110
                          ${hero ? "border-white/30" : "border-gray-200"}`}>
        <ArrowUpRight size={12} />
      </button>
      <p className={`text-xs sm:text-sm font-semibold ${hero ? "text-white/80" : "text-gray-600"}`}>{label}</p>
      {/* Number shrinks on mobile to prevent overflow */}
      <p className="text-3xl sm:text-4xl font-bold mt-2 mb-3 leading-none">{value}</p>
      {trendLabel && (
        <div className={`flex items-center gap-1.5 text-xs ${hero ? "text-white/60" : "text-gray-400"}`}>
          {trend && (trend === "up" ? <TrendingUp size={12}/> : <TrendingDown size={12}/>)}
          <span className="truncate">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
```

---

### Responsive Pill Bar Chart

```jsx
// Fewer bars on mobile, labels hide on xs
function PillBarChart({ data, height = 160 }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 sm:gap-2" style={{ height }}>
      {data.map((d, i) => {
        const pct = d.value / max;
        const barH = Math.max(pct * (height - 32), 12);
        return (
          // Hide weekend bars on mobile if there are 7+ bars
          <div key={i} className={`flex flex-col items-center gap-1.5 flex-1 ${i === 0 || i === 6 ? "hidden sm:flex" : "flex"}`}>
            <div className="relative w-full flex justify-center" style={{ height: height - 24 }}>
              <div className="absolute bottom-0 w-full max-w-[36px] rounded-full"
                style={{ height: `${height - 24}px`,
                  background: "repeating-linear-gradient(-45deg,#e5e7eb 0px,#e5e7eb 3px,#f3f4f6 3px,#f3f4f6 8px)",
                  borderRadius: 999 }} />
              <div className="absolute bottom-0 w-full max-w-[36px] rounded-full transition-all duration-700"
                style={{ height: `${barH}px`,
                  background: d.active ? "#52b788" : "#1a472a",
                  borderRadius: 999 }} />
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
```

---

### Responsive Notification Popover

```jsx
function NotificationPopover() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <TopBarIconBtn icon={<Bell size={18}/>} badge={3} onClick={() => setOpen(p => !p)} />
      {open && (
        <>
          {/* Mobile: full-width panel anchored to top. Desktop: dropdown */}
          <div className={`
            fixed sm:absolute z-50 bg-white rounded-2xl shadow-xl border border-gray-100
            top-14 sm:top-auto sm:mt-2
            left-2 right-2 sm:left-auto sm:right-0 sm:w-80
          `}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <button className="text-xs text-[#1a472a] font-medium">Mark all read</button>
            </div>
            <div className="max-h-72 sm:max-h-80 overflow-y-auto">
              <NotificationList items={[]} />
            </div>
          </div>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  );
}
```

---

### Responsive Search + Filter Bar

```jsx
function SearchFilterBar({ onSearch, filters, activeFilters, onFilterChange }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Search — full width on mobile */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 flex-1">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input placeholder="Search..." onChange={e => onSearch?.(e.target.value)}
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0" />
        </div>

        {/* Filter toggle on mobile, inline on sm+ */}
        <button onClick={() => setFiltersOpen(p => !p)}
          className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white">
          <Filter size={14}/> Filters
          {activeFilters?.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#1a472a] text-white text-[9px] flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
        </button>

        {/* Desktop: always show export */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
          <Download size={14}/> Export
        </button>
      </div>

      {/* Filter chips — collapsed on mobile until toggled */}
      <div className={`flex flex-wrap gap-2 ${filtersOpen ? "flex" : "hidden sm:flex"}`}>
        {filters?.map(f => (
          <button key={f.id} onClick={() => onFilterChange?.(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all
              ${activeFilters?.includes(f.id)
                ? "bg-[#1a472a] text-white border-[#1a472a]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#52b788]"}`}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### Touch-Friendly Sizing Rules

```jsx
// All interactive targets meet 44×44px minimum on mobile
// Apply to any clickable element on mobile:
const touchTarget = "min-h-[44px] min-w-[44px]"; // or ensure padding makes it so

// Button touch sizes
const buttonSizes = {
  xs: "text-xs px-2.5 py-2   sm:py-1.5",   // taller on mobile
  sm: "text-sm px-3   py-2.5 sm:py-2",
  md: "text-sm px-4   py-3   sm:py-2.5",
  lg: "text-base px-6 py-3.5 sm:py-3",
};

// Toggle — always 44px tap area even if visual is smaller
function Toggle({ label, checked, onChange, description }) {
  return (
    <div className="flex items-start gap-3">
      <button onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors mt-0.5
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#52b788]
          ${checked ? "bg-[#1a472a]" : "bg-gray-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
          ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
```

---

### Responsive Skeleton Adjustments

```jsx
// StatRow skeleton: 1 col → 2 col → 4 col (matches real StatCard grid)
function StatRowSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
      <StatCardSkeleton hero />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
}

// Full page skeleton mirrors responsive grid
function DashboardPageSkeleton() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-8 w-36 sm:w-44" />
          <Skeleton className="h-3 w-56 sm:w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      <StatRowSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        <div className="md:col-span-2"><CardSkeleton hasHeader hasChart height={220} /></div>
        <CardSkeleton hasHeader lines={2} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <Skeleton className="h-4 w-36 mb-4" />
          <ListItemSkeleton count={4} />
        </div>
        <CardSkeleton hasHeader hasChart height={200} />
        <Skeleton className="rounded-2xl h-48 md:h-full" style={{ background: "linear-gradient(135deg,#1a472a22,#0d281822)" }} />
      </div>
    </div>
  );
}
```

---

## 30. Responsive System — Complete Reference

### Breakpoints
```
xs  (default)   < 640px    — phones, portrait
sm  640px+               — large phones, landscape / small tablets
md  768px+               — tablets, portrait
lg  1024px+              — tablets landscape, small laptops
xl  1280px+              — desktops
2xl 1536px+              — large monitors
```

Donezo uses three logical tiers: **mobile** (< 768px) · **tablet** (768–1023px) · **desktop** (≥ 1024px).
Use `useBreakpoint()` whenever JS logic (not just styling) needs to branch.

---

### Responsive Grid Patterns

Always write **mobile-first**: start with 1 column, scale up.

```jsx
// Dashboard stat row
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

// Mid content (analytics + reminders + project list)
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2"> {/* Analytics chart */} </div>
  <div> {/* Reminders */} </div>
</div>

// Bottom row (team + progress + time tracker)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Settings two-panel (handled by SettingsPage component)
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
  <aside className="w-full md:w-48 lg:w-56 flex-shrink-0"> ... </aside>
  <main className="flex-1 min-w-0"> ... </main>
</div>

// 2-col form row (e.g., first name + last name)
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

// 3-col card grid (reports, integrations)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Full-width on mobile, auto on desktop
<button className="w-full sm:w-auto"> ... </button>
```

---

### Responsive Typography
```jsx
// Page title
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">

// Section heading
<h2 className="text-lg sm:text-xl font-semibold">

// Card title (stays fixed — no need to scale)
<h3 className="text-[15px] font-semibold">

// Body text
<p className="text-xs sm:text-sm text-gray-600">

// Truncate long text on narrow screens
<p className="truncate">               {/* single line */}
<p className="line-clamp-2">           {/* two lines */}
```

---

### Responsive Spacing
```jsx
// Page padding
<main className="p-3 sm:p-4 md:p-6">

// Card padding
<div className="p-4 sm:p-5">

// Section gaps
<div className="space-y-4 sm:space-y-5 md:space-y-6">
<div className="gap-3 sm:gap-4">
```

---

### Visibility — What to show/hide at each breakpoint
```jsx
// Mobile-only elements
<div className="block sm:hidden">   {/* hamburger button, mobile nav */}

// Hidden on mobile, shown on tablet+
<div className="hidden sm:flex">    {/* secondary icon buttons in topbar */}
<div className="hidden md:block">   {/* user name+email in topbar */}

// Hidden on mobile + tablet, shown on desktop only
<div className="hidden lg:block">   {/* sidebar label text, kbd shortcut hint */}
<td className="hidden lg:table-cell"> {/* low-priority table column */}

// Always shown
<div>                               {/* primary actions, core content */}
```

---

### Touch Targets
All tappable elements on mobile must be at least **44×44px**:
```jsx
// Standard icon button — meets 44px naturally
<button className="w-11 h-11 flex items-center justify-center rounded-xl">

// Smaller icon but with enough padding
<button className="p-3 rounded-xl">  {/* icon is 16–18px, total ~44px */}

// Nav items — add more vertical padding on mobile
<button className="py-3 sm:py-2.5 px-3 rounded-xl">

// List items with tap action — ensure min height
<li className="min-h-[44px] flex items-center gap-3 px-3">
```

---

### Flex overflow prevention
Every component inside a flex row needs `min-w-0` to prevent overflow:
```jsx
<div className="flex items-center gap-3">
  <Avatar />
  <div className="flex-1 min-w-0">       {/* ← required */}
    <p className="truncate">Long text</p>
  </div>
</div>
```

---

### Responsive Notification / Popover positioning
```jsx
// Desktop: right-anchored dropdown
// Mobile: full-width panel below topbar
function ResponsivePopover({ anchor, children }) {
  const bp = useBreakpoint();
  if (bp === "mobile") {
    return (
      <div className="fixed top-14 left-2 right-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100">
        {children}
      </div>
    );
  }
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
      {children}
    </div>
  );
}
```

---

### Responsive Dashboard Layout — Full Example
```jsx
function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">

      {/* Page header */}
      <PageHeader title="Dashboard" subtitle="Plan and prioritize." actions={
        <><Button variant="outline" size="sm">Import</Button>
          <Button variant="primary" icon={<Plus size={15}/>}>Add Project</Button></>
      } />

      {/* Stat cards: 1→2→4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Projects" value="24" trend="up" trendLabel="vs last month" hero />
        <StatCard label="Ended"          value="10" trend="up" trendLabel="vs last month" />
        <StatCard label="Running"        value="12" trend="up" trendLabel="vs last month" />
        <StatCard label="Pending"        value="2"  trendLabel="On Discuss" />
      </div>

      {/* Mid row: analytics takes 2/3 on lg+, full width below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Project Analytics" className="lg:col-span-2"
          headerAction={<LiveDot />}>
          <PillBarChart data={chartData} />
        </Card>
        <ReminderCard title="Meeting with Arc" time="02:00 pm – 04:00 pm" />
      </div>

      {/* Bottom row: 1→2→3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Team Collaboration"
          headerAction={<Button size="xs" variant="outline" icon={<Plus size={12}/>}>Add Member</Button>}>
          <ActivityList items={teamItems} />
        </Card>

        <Card title="Project Progress">
          <DonutWithLabel value="41%" label="Project Ended" segments={donutSegments} />
        </Card>

        <TimeTrackerWidget />
      </div>
    </div>
  );
}
```

---

### Responsive SearchFilterBar
```jsx
function SearchFilterBar({ onSearch, filters, activeFilters, onFilterChange }) {
  const [showFilters, setShowFilters] = useState(false);
  return (
    <div className="space-y-2 sm:space-y-0">
      <div className="flex items-center gap-2">
        {/* Search — full width on mobile */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 flex-1">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input placeholder="Search..." onChange={e => onSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0" />
        </div>
        {/* On mobile: toggle filter row */}
        <button onClick={() => setShowFilters(p => !p)}
          className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600">
          <Filter size={16} />
        </button>
        {/* On tablet+: inline filter chips */}
        <div className="hidden sm:flex items-center gap-2">
          {filters?.map(f => (
            <button key={f.id} onClick={() => onFilterChange(f.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap
                ${activeFilters?.includes(f.id)
                  ? "bg-[#1a472a] text-white border-[#1a472a]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#52b788]"}`}>
              {f.icon} {f.label}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 whitespace-nowrap">
            <Download size={14}/> Export
          </button>
        </div>
      </div>

      {/* Mobile filter row — collapsible */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 sm:hidden">
          {filters?.map(f => (
            <button key={f.id} onClick={() => onFilterChange(f.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border
                ${activeFilters?.includes(f.id)
                  ? "bg-[#1a472a] text-white border-[#1a472a]"
                  : "bg-white text-gray-600 border-gray-200"}`}>
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Toast container — responsive position
```jsx
// Mobile: full-width at bottom. Desktop: fixed-width at bottom-right.
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-auto sm:right-4 z-[100]
                    flex flex-col gap-2 p-2 sm:p-0">
      {toasts.map(toast => (
        <div key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl sm:rounded-xl shadow-lg border
                      w-full sm:max-w-sm sm:w-[360px]
            ${toast.type === "success" ? "bg-white border-[#52b788]" :
              toast.type === "error"   ? "bg-white border-red-300" :
              toast.type === "warning" ? "bg-white border-amber-300" :
                                         "bg-white border-gray-200"}`}>
          {/* ... same icon/content as before ... */}
        </div>
      ))}
    </div>
  );
}
```

---

### Responsive Utility Classes — Quick Reference

```
Layout:
  flex-col sm:flex-row          — stack mobile, row tablet+
  flex-col md:flex-row          — stack mobile+tablet, row desktop
  hidden sm:block / sm:flex     — hide on mobile only
  hidden md:block               — hide on mobile and tablet
  block sm:hidden               — show mobile only

Grids:
  grid-cols-1 sm:grid-cols-2 xl:grid-cols-4
  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  col-span-1 lg:col-span-2

Spacing:
  p-3 sm:p-4 md:p-5 lg:p-6
  gap-2 sm:gap-3 md:gap-4
  space-y-3 md:space-y-4 lg:space-y-6

Text:
  text-xl sm:text-2xl lg:text-3xl   — responsive headings
  text-xs sm:text-sm                — body text
  truncate                          — single line overflow
  line-clamp-2                      — two-line clamp

Widths:
  w-full sm:w-auto              — full-width on mobile
  max-w-xs sm:max-w-md          — responsive max-width
  min-w-0                       — prevent flex overflow

Touch:
  min-h-[44px]                  — minimum tap target
  py-3 sm:py-2.5                — extra vertical padding on mobile

Tables:
  overflow-x-auto               — horizontal scroll wrapper
  min-w-[500px]                 — prevent table from collapsing
  hidden lg:table-cell          — optional column on large screens only
```

---

## Design Rules (always follow)

1. **Font**: Always load and use `DM Sans`. Numbers in tracker/mono → `DM Mono`.
2. **Rounding**: Cards `rounded-2xl`, buttons `rounded-xl`, tags `rounded-full`. Never sharp corners.
3. **Shadows**: Only `shadow-sm` on cards. Save `shadow-lg / shadow-xl` for modals and popovers.
4. **Color discipline**: One hero `bg-[#1a472a]` element per section. Everything else white or `bg-[#f4f6f4]`.
5. **Sidebar collapsed state**: Icons only, 72px wide, toggle arrow on the right edge.
6. **Settings**: Always uses a two-panel layout — settings sidebar (left) + content (right); on mobile, a dropdown selector replaces the sidebar.
7. **Profile**: A settings sidebar item, but also surfaceable as a topbar dropdown destination.
8. **Table rows**: Hover reveals action buttons (`opacity-0 group-hover:opacity-100`); on mobile, show a card list instead via `MobileTableCard`.
9. **Modals**: Always `backdrop-blur-sm`, `rounded-2xl`, close on Escape and backdrop click; on mobile slide up from bottom as a bottom sheet.
10. **Empty states**: Use the brand green icon container, never just text.
11. **Pill bar charts**: Stripes for empty segments — never plain gray fill.
12. **All data props**: Every component accepts real data via props — no hardcoded placeholder text inside reusable components.
13. **Transitions**: `transition-all duration-200` or `duration-300` on interactive elements; sidebar width transition `duration-300 ease-in-out`.
14. **Mobile-first grids**: Always write `grid-cols-1` first, then `sm:grid-cols-2`, then `lg:grid-cols-3/4`. Never start with a multi-column grid and hide on mobile.
15. **Skeleton shapes must match**: Every skeleton mirrors the exact layout of its real counterpart AND its responsive grid — `StatRowSkeleton` uses `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` just like `StatCard`.
16. **Shimmer not pulse**: Use the gradient shimmer animation (see `Skeleton` base) not Tailwind `animate-pulse`.
17. **Loading hierarchy**: Initial load → `SplashLoader`. Page nav → `TopProgressBar`. First data fetch → skeleton. Refetch → `LoadingOverlay`. Button action → `LoadingButton`. Never full-screen spinner for a card refetch.
18. **Call `injectSkeletonKeyframes()`** once in your app root so the shimmer animation is always available.
19. **`LiveDot`** should appear beside chart titles or in the TopBar whenever data is real-time or auto-refreshing.
20. **`PageFade`** wraps every top-level page/view for smooth route transitions — pass the current route as `key` prop.
21. **Touch targets**: All interactive elements must be at least 44×44px on mobile — use extra vertical padding (`py-3 sm:py-2.5`) and `min-h-[44px]` where needed.
22. **`useBreakpoint()`**: Use this hook (not CSS-only) whenever component logic (not just styling) needs to adapt — e.g. switching between sidebar modes, showing/hiding the mobile drawer.
23. **Popover positioning on mobile**: Popovers (notifications, dropdowns) that anchor to a topbar icon should switch to a near-full-width panel positioned below the topbar (`fixed top-14 left-2 right-2`) instead of a narrow right-anchored dropdown.
24. **No horizontal overflow**: Every container must have `min-w-0` if inside a flex row, and tables must be wrapped in `overflow-x-auto` with a `min-w-[Npx]` on the table itself.