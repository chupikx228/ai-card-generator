import type { ReactNode } from 'react'
import { cn } from '../lib/text'

type FlashCardProps = {
  front: ReactNode
  back: ReactNode
  flipped: boolean
  onFlip: () => void
  label: string
  className?: string
}

const faceClass = 'absolute inset-0 flex flex-col rounded-[22px] backface-hidden'

export const FlashCard = ({ front, back, flipped, onFlip, label, className }: FlashCardProps) => (
  <button
    type="button"
    onClick={onFlip}
    aria-label={label}
    aria-pressed={flipped}
    className={cn('group relative block w-full cursor-pointer rounded-[22px] text-left perspective-[1400px]', className)}
  >
    <span
      className={cn(
        'relative block h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.3,0.7,0.2,1)] transform-3d motion-reduce:transition-none',
        flipped && 'rotate-y-180',
      )}
    >
      <span
        className={cn(
          faceClass,
          'border border-border bg-surface-raised shadow-card transition-shadow group-hover:shadow-lift',
        )}
      >
        {front}
      </span>
      <span className={cn(faceClass, 'rotate-y-180 bg-primary text-primary-foreground shadow-lift')}>{back}</span>
    </span>
  </button>
)
