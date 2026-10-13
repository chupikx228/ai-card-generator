import { cn } from '@/shared/lib/cn'

type ChipsProps = {
  items: string[]
  value?: string
  onSelect: (item: string) => void
  disabled?: boolean
  className?: string
}

export const Chips = ({ items, value, onSelect, disabled = false, className }: ChipsProps) => (
  <div role="group" className={cn('flex flex-wrap gap-2', className)}>
    {items.map((item) => {
      const active = item === value

      return (
        <button
          key={item}
          type="button"
          disabled={disabled}
          aria-pressed={active}
          onClick={() => onSelect(item)}
          className={cn(
            'rounded-card px-3 py-1.5 text-[13px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50',
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary-soft text-primary hover:brightness-105',
          )}
        >
          {item}
        </button>
      )
    })}
  </div>
)
