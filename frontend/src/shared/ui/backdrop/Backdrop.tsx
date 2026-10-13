import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type BackdropProps = {
  children: ReactNode
  className?: string
}

export const Backdrop = ({ children, className }: BackdropProps) => (
  <div className={cn('relative isolate overflow-hidden', className)}>
    <div
      aria-hidden
      className="pointer-events-none absolute -top-32 right-[-6rem] -z-10 h-96 w-96 rounded-full bg-primary opacity-10 blur-3xl"
    />
    {children}
  </div>
)
