import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const baseClass =
  'inline-flex items-center justify-center gap-2 rounded-card font-semibold tracking-[0.01em] transition-[filter,opacity] active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow-card hover:brightness-110',
  secondary:
    'bg-glass text-foreground backdrop-blur-[24px] backdrop-saturate-150 shadow-card hover:brightness-105',
  ghost: 'text-foreground hover:bg-primary-soft',
}

const sizeClass: Record<ButtonSize, string> = {
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-13 px-7 text-[15px]',
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(baseClass, variantClass[variant], sizeClass[size], className)}
    {...props}
  />
)
