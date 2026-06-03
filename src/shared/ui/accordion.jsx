import * as React from 'react'
import { cn } from '../lib/utils'

const AccordionContext = React.createContext(null)
const AccordionItemContext = React.createContext(null)

export const Accordion = React.forwardRef(({ type = 'single', defaultValue, onValueChange, className, children, ...props }, ref) => {
  const [activeItems, setActiveItems] = React.useState(() => {
    if (defaultValue) return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
    return []
  })

  const toggleItem = React.useCallback((itemValue) => {
    let nextItems
    if (type === 'single') {
      nextItems = activeItems.includes(itemValue) ? [] : [itemValue]
    } else {
      nextItems = activeItems.includes(itemValue)
        ? activeItems.filter((v) => v !== itemValue)
        : [...activeItems, itemValue]
    }
    setActiveItems(nextItems)
    if (onValueChange) {
      onValueChange(type === 'single' ? nextItems[0] || '' : nextItems)
    }
  }, [activeItems, type, onValueChange])

  return (
    <AccordionContext.Provider value={{ activeItems, toggleItem }}>
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
})
Accordion.displayName = 'Accordion'

export const AccordionItem = React.forwardRef(({ value, className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error('AccordionItem must be used within Accordion')

  const isOpen = context.activeItems.includes(value)

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        ref={ref}
        className={cn(
          'border border-slate-800/80 bg-slate-950/40 rounded-xl overflow-hidden transition-all duration-300',
          isOpen ? 'bg-slate-950/80 border-slate-800' : '',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
})
AccordionItem.displayName = 'AccordionItem'

export const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const accordionContext = React.useContext(AccordionContext)
  const itemContext = React.useContext(AccordionItemContext)
  if (!accordionContext || !itemContext) {
    throw new Error('AccordionTrigger must be used within AccordionItem')
  }

  const { isOpen, value } = itemContext

  return (
    <button
      ref={ref}
      className={cn(
        'flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-slate-100 hover:text-white transition-all [&[data-state=open]>svg]:rotate-180',
        className
      )}
      onClick={() => accordionContext.toggleItem(value)}
      data-state={isOpen ? 'open' : 'closed'}
      {...props}
    >
      <span>{children}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
})
AccordionTrigger.displayName = 'AccordionTrigger'

export const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const itemContext = React.useContext(AccordionItemContext)
  if (!itemContext) throw new Error('AccordionContent must be used within AccordionItem')

  const { isOpen } = itemContext

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn(
        'px-5 pb-5 pt-0 text-sm text-slate-400 leading-relaxed border-t border-slate-900/50 pt-4 animate-in slide-in-from-top-1 duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
AccordionContent.displayName = 'AccordionContent'
