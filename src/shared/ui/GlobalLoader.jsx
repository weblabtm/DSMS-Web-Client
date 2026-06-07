import { motion } from 'framer-motion'
import { useUiStore } from '../store/uiStore'

export default function GlobalLoader() {
  const isGlobalLoading = useUiStore((state) => state.isGlobalLoading)
  const loadingMessage = useUiStore((state) => state.loadingMessage)

  if (!isGlobalLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md overflow-hidden select-none"
    >
      {/* Ambient background glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 p-6 text-center max-w-sm">
        {/* Animated Custom Ring Spinner */}
        <div className="relative flex items-center justify-center">
          {/* Inner pulsing core */}
          <motion.div 
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/50" 
          />
          {/* Middle rotating ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="h-16 w-16 rounded-full border-4 border-slate-900 border-t-indigo-500 border-r-blue-400 shadow-md shadow-indigo-500/10"
          />
          {/* Outer glowing halo */}
          <div className="absolute h-20 w-20 rounded-full border-2 border-indigo-500/5 animate-pulse" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Please Wait
          </h3>
          <p className="text-sm font-medium leading-relaxed text-slate-400 tracking-wide animate-pulse">
            {loadingMessage || 'Processing your request...'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
