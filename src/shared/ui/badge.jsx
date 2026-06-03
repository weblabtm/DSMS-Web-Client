import { cn } from '../lib/utils'

export function Badge({ className, variant = 'default', ...props }) {
  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  
  const variants = {
    default: 'border-transparent bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    secondary: 'border-transparent bg-slate-900 text-slate-300 border-slate-800',
    destructive: 'border-transparent bg-red-500/10 text-red-400 border-red-500/30',
    outline: 'text-slate-300 border-slate-800 bg-transparent',
    success: 'border-transparent bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  }

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props} />
  )
}
