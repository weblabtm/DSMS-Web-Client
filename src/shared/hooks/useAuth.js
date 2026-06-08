/**
 * @file useAuth.js
 * @layer LOGIC — The official public hook for auth. No JSX. No UI imports.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  THIS IS THE ONLY DOOR THAT UI / PAGE COMPONENTS SHOULD USE
 *  TO INTERACT WITH THE AUTH SYSTEM.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE
 * -------
 * A thin wrapper over useAuthStore that:
 *   1. Exposes a clean, stable API surface so UI components are decoupled
 *      from the internal store structure.
 *   2. Adds role-based invitation helpers (canInviteRole, getInviteableRoles)
 *      that mirror the server's AuthService role rules.
 *
 * WHY THIS EXISTS (separation of concerns)
 * ----------------------------------------
 * Without this hook, UI developers would import useAuthStore directly and
 * risk calling internal set() / get() methods or reading raw store fields
 * that could change. This hook is a stable contract:
 *   • The public shape of useAuth() never changes without a team decision.
 *   • The internal store (authStore.js) can be refactored freely as long
 *     as this hook's return value stays the same.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Import useAuth from this file in ALL page and UI components.      ║
 * ║    • Add new derived state / helper functions to this hook.            ║
 * ║    • Keep role permission tables in sync with the server's             ║
 * ║      AuthService.ts (same hierarchy must apply on both sides).         ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Import useAuthStore directly from page/component files.           ║
 * ║    • Add JSX or React component logic to this file.                    ║
 * ║    • Duplicate role rules here without updating the server too.        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * ROLE HIERARCHY (must match server AuthService.ts)
 * --------------------------------------------------
 * Super Admin    can invite: Tenant Admin
 * Tenant Admin   can invite: Branch Manager, Instructor, Front Desk, Student
 * Branch Manager can invite: Instructor, Front Desk, Student
 * Front Desk     can invite: Student
 * Others         cannot invite anyone
 *
 * RETURN VALUE
 * ------------
 * {
 *   // State (read-only mirrors of authStore)
 *   user:            object | null
 *   isAuthenticated: boolean
 *   isLoading:       boolean
 *   isInitialized:   boolean
 *   error:           string | null
 *   currentRole:     string | null   — first role from user.roles[]
 *
 *   // Auth Actions (call these to trigger auth flows)
 *   login:           (credentials) => Promise<session>
 *   completeLogin:   () => Promise<session>
 *   register:        (account, inviterToken?) => Promise<session>
 *   logout:          () => Promise<void>
 *   refreshToken:    () => Promise<session>
 *   initStore:       () => Promise<void>
 *   clearError:      () => void
 *   setSession:      (session) => void
 *
 *   // Role-based invitation helpers
 *   canInviteRole:   (targetRole: string) => boolean
 *   getInviteableRoles: () => string[]
 * }
 */

import { useAuthStore } from '../store/authStore'

/**
 * Pure function (no hooks) — can be called outside React components.
 *
 * Checks whether a user with inviterRole is permitted to invite a user
 * with targetRole. This mirrors the server-side AuthService.ts logic and
 * must stay in sync with it.
 *
 * ⚠️  AGENT WARNING: If the server's role hierarchy changes, update BOTH
 *     this function AND the server's AuthService.ts. They must always match.
 *
 * @param {string|null} inviterRole  Role of the user doing the inviting
 * @param {string}      targetRole   Role being assigned to the invitee
 * @returns {boolean}
 */
export function canInviteRole(inviterRole, targetRole) {
  if (!inviterRole) return false

  switch (inviterRole) {
    case 'Super Admin':
      // Super Admins can only create Tenant Admin accounts (school owners)
      return targetRole === 'Tenant Admin'
    case 'Tenant Admin':
      // Tenant Admins manage their whole school staff + students
      return ['Branch Manager', 'Instructor', 'Front Desk', 'Student'].includes(targetRole)
    case 'Branch Manager':
      // Branch Managers manage staff and students within their branch
      return ['Instructor', 'Front Desk', 'Student'].includes(targetRole)
    case 'Front Desk':
      // Front Desk staff can only enrol students
      return targetRole === 'Student'
    default:
      // Students and any unknown roles cannot invite anyone
      return false
  }
}

/**
 * useAuth — primary auth hook for all UI components.
 *
 * @returns {object} see file-level JSDoc for full return shape
 */
export function useAuth() {
  const store = useAuthStore()

  // Primary role: users in this system have one active role per session.
  // user.roles is an array to be future-proof, but index [0] is the effective role.
  const currentRole = store.user?.roles?.[0] || null

  /**
   * Whether the current user can invite a specific target role.
   * @param {string} targetRole
   * @returns {boolean}
   */
  const userCanInvite = (targetRole) => {
    return canInviteRole(currentRole, targetRole)
  }

  /**
   * Returns all roles the current user is authorized to invite.
   * Useful for populating invite-role dropdown menus.
   * @returns {string[]}
   */
  const getInviteableRoles = () => {
    if (!currentRole) return []
    const allRoles = ['Super Admin', 'Tenant Admin', 'Branch Manager', 'Instructor', 'Front Desk', 'Student']
    return allRoles.filter(role => canInviteRole(currentRole, role))
  }

  return {
    // ── State ─────────────────────────────────────────────────────────────
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    error: store.error,

    // ── Auth Actions ───────────────────────────────────────────────────────
    login: store.login,
    completeLogin: store.completeLogin,
    register: store.register,
    logout: store.logout,
    refreshToken: store.refreshToken,
    initStore: store.initStore,
    clearError: store.clearError,
    setSession: store.setSession,

    // ── Role helpers ───────────────────────────────────────────────────────
    currentRole,
    canInviteRole: userCanInvite,
    getInviteableRoles,
  }
}

// Re-export the store itself ONLY for the rare cases where you need to read
// state outside a React component (e.g. http-client.js, which runs outside
// the component tree). Page/UI code must use the useAuth() hook above.
export { useAuthStore }
