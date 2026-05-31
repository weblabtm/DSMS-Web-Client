import * as React from 'react'
import { cn } from '../lib/utils'

const TabsContext = React.createContext(null)

export const Tabs = React.forwardRef(({ value, defaultValue, onValueChange, className, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(value || defaultValue)

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleTabChange = React.useCallback((newValue) => {
    setActiveTab(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }, [onValueChange])

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = 'Tabs'

export const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 border border-slate-800/80 p-1 text-slate-400',
      className
    )}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = React.forwardRef(({ value, className, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const isActive = context.activeTab === value

  return (
    <button
      ref={ref}
      role="tab"
      aria-selected={isActive}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-slate-900 text-white shadow-md border border-slate-800'
          : 'hover:bg-slate-900/40 hover:text-slate-200',
        className
      )}
      onClick={() => context.setActiveTab(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = React.forwardRef(({ value, className, children, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  const isActive = context.activeTab === value

  if (!isActive) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn(
        'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = 'TabsContent'
