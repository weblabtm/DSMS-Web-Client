/**
 * Tab Configuration Types
 * 
 * Defines the structure for tab configurations used in TabLayout components
 */

/**
 * @typedef {Object} TabConfig
 * @property {string} id - Unique identifier for the tab
 * @property {string} label - Display label for the tab
 * @property {React.Component} component - Page component to render when tab is active
 * @property {string} [path] - Optional URL path for routing (e.g., '/dashboard', '/users')
 * @property {React.Component} [icon] - Optional icon component from lucide-react
 * @property {string} [badge] - Optional badge text to display on tab
 * @property {boolean} [disabled] - Optional flag to disable tab interaction
 * @property {Function} [onClick] - Optional custom click handler
 */

/**
 * Example usage:
 * 
 * import { LayoutDashboard, Users, Settings } from 'lucide-react'
 * import DashboardPage from './pages/DashboardPage'
 * import UsersPage from './pages/UsersPage'
 * import SettingsPage from './pages/SettingsPage'
 * 
 * const tabs = [
 *   {
 *     id: 'dashboard',
 *     label: 'Dashboard',
 *     component: DashboardPage,
 *     path: '/dashboard',
 *     icon: LayoutDashboard
 *   },
 *   {
 *     id: 'users',
 *     label: 'Users',
 *     component: UsersPage,
 *     path: '/users',
 *     icon: Users,
 *     badge: '12'
 *   },
 *   {
 *     id: 'settings',
 *     label: 'Settings',
 *     component: SettingsPage,
 *     path: '/settings',
 *     icon: Settings
 *   }
 * ]
 */

export const createTabConfig = (tabs) => {
  return tabs.map(tab => ({
    id: tab.id,
    label: tab.label,
    component: tab.component,
    path: tab.path,
    icon: tab.icon,
    badge: tab.badge,
    disabled: tab.disabled || false,
    onClick: tab.onClick
  }))
}

/**
 * Validates a tab configuration array
 * @param {Array} tabs - Array of tab configurations
 * @returns {Object} Validation result with isValid and errors
 */
export const validateTabConfig = (tabs) => {
  const errors = []
  
  if (!Array.isArray(tabs)) {
    errors.push('Tabs must be an array')
    return { isValid: false, errors }
  }
  
  tabs.forEach((tab, index) => {
    if (!tab.id) errors.push(`Tab at index ${index} is missing required 'id' property`)
    if (!tab.label) errors.push(`Tab at index ${index} is missing required 'label' property`)
    if (!tab.component) errors.push(`Tab at index ${index} is missing required 'component' property`)
  })
  
  const ids = tabs.map(t => t.id)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    errors.push('Tab IDs must be unique')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Default tab configurations for common dashboard patterns
 */
export const DEFAULT_DASHBOARD_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/dashboard'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics'
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports'
  }
]

export const DEFAULT_SETTINGS_TABS = [
  {
    id: 'profile',
    label: 'Profile',
    path: '/settings/profile'
  },
  {
    id: 'preferences',
    label: 'Preferences',
    path: '/settings/preferences'
  },
  {
    id: 'security',
    label: 'Security',
    path: '/settings/security'
  }
]
