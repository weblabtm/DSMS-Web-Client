import { create } from 'zustand'

export const useUiStore = create((set) => ({
  isGlobalLoading: false,
  loadingMessage: '',
  showLoader: (message = 'Processing...') => set({ isGlobalLoading: true, loadingMessage: message }),
  hideLoader: () => set({ isGlobalLoading: false, loadingMessage: '' }),
}))
