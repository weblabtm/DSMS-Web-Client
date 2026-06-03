import * as React from 'react'
import { cn } from '../lib/utils'

export const Slider = React.forwardRef(({ className, value, defaultValue, min = 0, max = 100, step = 1, onValueChange, ...props }, ref) => {
  const [val, setVal] = React.useState(() => {
    if (value !== undefined && Array.isArray(value)) return value[0]
    if (defaultValue !== undefined && Array.isArray(defaultValue)) return defaultValue[0]
    return min
  })

  React.useEffect(() => {
    if (value !== undefined && Array.isArray(value)) {
      setVal(value[0])
    }
  }, [value])

  const handleChange = (e) => {
    const newVal = parseFloat(e.target.value)
    setVal(newVal)
    if (onValueChange) {
      onValueChange([newVal])
    }
  }

  const percent = ((val - min) / (max - min)) * 100

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center py-4', className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-900 border border-slate-800">
        <div 
          className="absolute h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full" 
          style={{ width: `${percent}%` }}
        />
      </div>
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={handleChange}
        className="absolute w-full h-6 opacity-0 cursor-pointer"
        {...props}
      />
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-indigo-400 bg-slate-950 shadow-lg pointer-events-none transition-all duration-75 duration-100 ease-out"
        style={{ left: `calc(${percent}% - 10px)` }}
      />
    </div>
  )
})
Slider.displayName = 'Slider'
