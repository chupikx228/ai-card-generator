import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/shared/lib/cn'

type FeatureCardProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  className?: string
}

export const FeatureCard = ({ icon: Icon, title, description, className }: FeatureCardProps) => (
  <div className={cn('rounded-card border border-border bg-surface p-6 shadow-card', className)}>
    <span className="inline-flex size-11 items-center justify-center rounded-card bg-primary-soft text-accent">
      <Icon className="size-6" />
    </span>
    <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
    <p className="mt-2 text-[15px] leading-6 text-muted">{description}</p>
  </div>
)
