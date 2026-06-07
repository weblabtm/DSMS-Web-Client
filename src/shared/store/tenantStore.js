import { create } from 'zustand'

export const useTenantStore = create((set) => ({
  isResolved: false,
  tenant: null,
  setTenant: (tenant) => set({ tenant, isResolved: true }),
  clearTenant: () => set({ tenant: null, isResolved: false }),
}))
