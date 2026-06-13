import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * TabLayout - A reusable tab-based layout component
 * 
 * @param {Array} tabs - Array of tab configurations
 * @param {string} tabs[].id - Unique identifier for the tab
 * @param {string} tabs[].label - Display label for the tab
 * @param {React.Component} tabs[].component - Page component to render
 * @param {string} tabs[].path - URL path for the tab
 * @param {Object} tabs[].icon - Optional icon component from lucide-react
 * @param {string} tabs[].badge - Optional badge text
 * @param {Object} props - Additional props to pass to tab components
 * 
 * @example
 * const tabs = [
 *   { id: 'dashboard', label: 'Dashboard', component: DashboardPage, path: '/dashboard', icon: LayoutDashboard },
 *   { id: 'users', label: 'Users', component: UsersPage, path: '/users', icon: Users, badge: '12' },
 *   { id: 'settings', label: 'Settings', component: SettingsPage, path: '/settings', icon: Settings }
 * ]
 * 
 * <TabLayout tabs={tabs} />
 */
export function TabLayout({ tabs, defaultTabId, className = '', ...props }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabId, setActiveTabId] = useState(() => {
    // Try to find active tab from current path
    const activeFromPath = tabs.find(tab => tab.path && location.pathname.startsWith(tab.path))
    if (activeFromPath) return activeFromPath.id
    
    // Fall back to defaultTabId or first tab
    return defaultTabId || tabs[0]?.id
  })

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  const handleTabClick = (tab) => {
    setActiveTabId(tab.id)
    if (tab.path) {
      navigate(tab.path)
    }
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200/50 mb-4 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTabId === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer
                ${isActive 
                  ? 'bg-[#1a472a] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {isActive && (
                <div className="absolute inset-0 bg-[#1a472a] rounded-xl" />
              )}
              <span className="relative flex items-center gap-2">
                {Icon && <Icon size={16} className="flex-shrink-0" />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`
                    text-[10px] px-1.5 py-0.5 rounded-lg font-bold
                    ${isActive ? 'bg-[#52b788] text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab?.component && (
          <div className="h-full">
            <activeTab.component {...props} />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * VerticalTabLayout - A vertical tab variant for sidebar-style navigation
 */
export function VerticalTabLayout({ tabs, defaultTabId, className = '', ...props }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabId, setActiveTabId] = useState(() => {
    const activeFromPath = tabs.find(tab => tab.path && location.pathname.startsWith(tab.path))
    if (activeFromPath) return activeFromPath.id
    return defaultTabId || tabs[0]?.id
  })

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  const handleTabClick = (tab) => {
    setActiveTabId(tab.id)
    if (tab.path) {
      navigate(tab.path)
    }
  }

  return (
    <div className={`flex gap-4 h-full ${className}`}>
      {/* Vertical Tab Navigation */}
      <aside className="w-56 flex-shrink-0 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm overflow-y-auto">
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTabId === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer
                  ${isActive 
                    ? 'bg-[#d8f3dc] text-[#1a472a]' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }
                `}
              >
                {Icon && <Icon size={16} className="flex-shrink-0" />}
                <span className="flex-1">{tab.label}</span>
                {tab.badge && (
                  <span className={`
                    text-[10px] px-1.5 py-0.5 rounded-lg font-bold
                    ${isActive ? 'bg-[#1a472a] text-white' : 'bg-gray-200 text-gray-600'}
                  `}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab?.component && (
          <div className="h-full">
            <activeTab.component {...props} />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * CollapsibleTabLayout - A collapsible tab layout with expand/collapse functionality
 */
export function CollapsibleTabLayout({ tabs, defaultTabId, className = '', ...props }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [activeTabId, setActiveTabId] = useState(() => {
    const activeFromPath = tabs.find(tab => tab.path && location.pathname.startsWith(tab.path))
    if (activeFromPath) return activeFromPath.id
    return defaultTabId || tabs[0]?.id
  })

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  const handleTabClick = (tab) => {
    setActiveTabId(tab.id)
    if (tab.path) {
      navigate(tab.path)
    }
  }

  return (
    <div className={`flex gap-4 h-full ${className}`}>
      {/* Collapsible Tab Navigation */}
      <aside className={`
        relative flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-300
        ${collapsed ? 'w-16' : 'w-56'}
      `}>
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-4 z-10 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTabId === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                title={collapsed ? tab.label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative
                  ${collapsed ? 'justify-center px-2' : ''}
                  ${isActive 
                    ? 'bg-[#d8f3dc] text-[#1a472a]' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }
                `}
              >
                {isActive && !collapsed && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#1a472a] rounded-r-md" />
                )}
                {Icon && <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-[#1a472a]' : ''}`} />}
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.badge && (
                      <span className={`
                        text-[10px] px-1.5 py-0.5 rounded-lg font-bold
                        ${isActive ? 'bg-[#1a472a] text-white' : 'bg-gray-200 text-gray-600'}
                      `}>
                        {tab.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab?.component && (
          <div className="h-full">
            <activeTab.component {...props} />
          </div>
        )}
      </div>
    </div>
  )
}
