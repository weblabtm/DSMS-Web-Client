import { useAuthStore } from '../store/authStore'

/**
 * Role Permission Rules for Invitations (matches server AuthService.ts)
 * 
 * • Super Admin can invite: Tenant Admin
 * • Tenant Admin can invite: Branch Manager, Instructor, Front Desk, Student
 * • Branch Manager can invite: Instructor, Front Desk, Student
 * • Front Desk can invite: Student
 * • Others cannot invite
 */
export function canInviteRole(inviterRole, targetRole) {
  if (!inviterRole) return false

  switch (inviterRole) {
    case 'Super Admin':
      return targetRole === 'Tenant Admin'
    case 'Tenant Admin':
      return ['Branch Manager', 'Instructor', 'Front Desk', 'Student'].includes(targetRole)
    case 'Branch Manager':
      return ['Instructor', 'Front Desk', 'Student'].includes(targetRole)
    case 'Front Desk':
      return targetRole === 'Student'
    default:
      return false
  }
}

/**
 * useAuth Hook
 * Thin wrapper for the Zustand auth store with helpers for role hierarchies.
 */
export function useAuth() {
  const store = useAuthStore()

  // Extract primary role (users typically have 1 primary role in our setup)
  const currentRole = store.user?.roles?.[0] || null

  /**
   * Helper to verify if the current user can invite a specific target role
   */
  const userCanInvite = (targetRole) => {
    return canInviteRole(currentRole, targetRole)
  }

  /**
   * Helper to get list of all roles the current user is authorized to invite
   */
  const getInviteableRoles = () => {
    if (!currentRole) return []
    const allRoles = ['Super Admin', 'Tenant Admin', 'Branch Manager', 'Instructor', 'Front Desk', 'Student']
    return allRoles.filter(role => canInviteRole(currentRole, role))
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    error: store.error,

    // Actions
    login: store.login,
    completeLogin: store.completeLogin,
    register: store.register,
    logout: store.logout,
    refreshToken: store.refreshToken,
    initStore: store.initStore,
    clearError: store.clearError,
    setSession: store.setSession,

    // Role-based invitation utilities
    currentRole,
    canInviteRole: userCanInvite,
    getInviteableRoles,
  }
}
export { useAuthStore }
