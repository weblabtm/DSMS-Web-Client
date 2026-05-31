import * as React from 'react'
import { cn } from '../lib/utils'

export function Carousel({ className, children, ...props }) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const items = React.Children.toArray(children)
  const total = items.length

  const next = React.useCallback(() => {
    setActiveIndex((current) => (current + 1) % total)
  }, [total])

  const prev = React.useCallback(() => {
    setActiveIndex((current) => (current - 1 + total) % total)
  }, [total])

  React.useEffect(() => {
    if (total <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, total])

  if (total === 0) return null

  return (
    <div className={cn('relative w-full overflow-hidden px-4 md:px-12', className)} {...props}>
      <div 
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {items.map((item, idx) => (
          <div key={idx} className="w-full shrink-0">
            {item}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: total }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer',
              activeIndex === idx ? 'bg-indigo-500 w-5' : 'bg-slate-800 hover:bg-slate-700'
            )}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {total > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button 
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </>
      )}
    </div>
  )
}
