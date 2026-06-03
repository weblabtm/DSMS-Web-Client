import * as React from 'react'
import { cn } from '../lib/utils'

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]'
  
  const variants = {
    default: 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500 hover:shadow-indigo-500/20 shadow-indigo-600/10',
    destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-500 shadow-red-600/10',
    outline: 'border border-slate-800 bg-slate-950/40 text-slate-200 hover:bg-slate-900 hover:text-white',
    secondary: 'bg-slate-900 text-slate-100 shadow-sm hover:bg-slate-800',
    ghost: 'text-slate-300 hover:bg-slate-900 hover:text-white',
    link: 'text-indigo-400 underline-offset-4 hover:underline',
  }

  const sizes = {
    default: 'h-11 px-5 py-2.5',
    sm: 'h-9 rounded-md px-3.5 text-xs',
    lg: 'h-12 rounded-lg px-8 text-base',
    icon: 'h-11 w-11 rounded-lg',
  }

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  )
})
Button.displayName = 'Button'
