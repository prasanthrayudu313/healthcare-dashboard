'use client'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'severity' | 'category' | 'lob'
  color?: string
  bg?: string
  className?: string
}

export function Badge({ children, color, bg, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        color || 'text-slate-300',
        bg || 'bg-slate-800',
        className
      )}
    >
      {children}
    </span>
  )
}
