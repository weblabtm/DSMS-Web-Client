/**
 * @file tenantStore.js
 * @layer LOGIC — Tenant resolution state. No JSX. No UI imports.
 *
 * PURPOSE
 * -------
 * Holds the result of the tenant resolution pipeline:
 *   TenantResolution.jsx  →  setTenant()  →  ProtectedRoute reads isResolved
 *
 * WHAT IS "RESOLUTION"?
 * ---------------------
 * Before a non-Super Admin user can access any dashboard page, the frontend
 * must verify that their tenant (school) is still active by calling the server.
 * TenantResolution.jsx does that check and stores the result here.
 *
 * ProtectedRoute.jsx reads isResolved and redirects to /resolve-user if false,
 * forcing the pipeline to run on every new browser session.
 *
 * STATE SHAPE
 * -----------
 * {
 *   isResolved: boolean       — true once TenantResolution has confirmed the tenant is active
 *   tenant:     object | null — full tenant object from GET /tenant/:slug
 * }
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  AGENT / DEVELOPER RULES                                                ║
 * ║                                                                         ║
 * ║  ✅ DO:                                                                 ║
 * ║    • Call setTenant() only from TenantResolution.jsx after a           ║
 * ║      successful server response confirming tenant.isActive === true.   ║
 * ║    • Call clearTenant() on logout (if you add a logout side-effect).   ║
 * ║                                                                         ║
 * ║  ❌ DO NOT:                                                             ║
 * ║    • Set isResolved = true without a server confirmation.              ║
 * ║    • Read or write this store directly from page components —          ║
 * ║      components should read tenant data through the RuntimeConfigContext║
 * ║      or via props passed down from layout components.                  ║
 * ║    • Skip the resolution pipeline to "save a step" — it is a security  ║
 * ║      check, not just routing convenience.                              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { create } from 'zustand'

export const useTenantStore = create((set) => ({
  /** Whether the tenant has been verified as active by the server this session. */
  isResolved: false,

  /** Full tenant object from GET /tenant/:slug (id, name, slug, isActive, plan, featureFlags…) */
  tenant: null,

  /**
   * Store the verified tenant and mark resolution as complete.
   * ONLY call this after the server confirms tenant.isActive === true.
   *
   * @param {object} tenant — tenant object from dsmsApi.getTenantBySlug()
   */
  setTenant: (tenant) => set({ tenant, isResolved: true }),

  /**
   * Reset tenant state (e.g. on logout or when switching tenants).
   * After calling this, ProtectedRoute will redirect to /resolve-user on next render.
   */
  clearTenant: () => set({ tenant: null, isResolved: false }),
}))
