import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type GlassPanelProps = HTMLAttributes<HTMLDivElement>

export const GlassPanel = ({ className, style, ...props }: GlassPanelProps) => (
  <div
    className={cn(
      'rounded-card bg-glass backdrop-blur-[24px] backdrop-saturate-150',
      className,
    )}
    style={{
      boxShadow: 'inset 0 1px 0 var(--glass-highlight), var(--shadow-card)',
      ...style,
    }}
    {...props}
  />
)
