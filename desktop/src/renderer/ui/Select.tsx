import { cn } from '../lib/text'

export const fieldClass =
  'h-12 rounded-2xl border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-muted focus:border-primary focus:bg-surface focus:outline-none'

export type SelectOption = {
  value: string
  label: string
}

type SelectProps = {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  label: string
  className?: string
}

export const Select = ({ value, options, onChange, label, className }: SelectProps) => (
  <div className={cn('relative', className)}>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className={cn(fieldClass, 'w-full cursor-pointer appearance-none truncate pr-11')}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 fill-none stroke-muted"
    >
      <path d="M4 6l4 4 4-4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
)
