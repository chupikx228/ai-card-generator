import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const baseProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const SparklesIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
    <path d="M18 15l.7 1.9L20.6 17.6l-1.9.7L18 20.2l-.7-1.9L15.4 17.6l1.9-.7z" />
  </svg>
)

export const RepeatIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M4 9a5 5 0 0 1 5-5h7" />
    <path d="M15 1l3 3-3 3" />
    <path d="M20 15a5 5 0 0 1-5 5H8" />
    <path d="M9 23l-3-3 3-3" />
  </svg>
)

export const CloudOffIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M3 3l18 18" />
    <path d="M6.7 18H17a4 4 0 0 0 1.1-7.8" />
    <path d="M8.2 6.1A5 5 0 0 1 16.9 9" />
  </svg>
)

export const DevicesIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <rect x="2.5" y="5" width="13" height="10" rx="1.6" />
    <path d="M3 19h11" />
    <rect x="16.5" y="9" width="5" height="11" rx="1.2" />
  </svg>
)

export const FlameIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M12 3s5 3.8 5 9a5 5 0 0 1-10 0c0-1.8.8-3 1.4-3.6.3 1.6 1.8 2.2 1.8 2.2S10.6 8 12 3z" />
  </svg>
)

export const SunIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
  </svg>
)

export const MoonIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </svg>
)

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </svg>
)

export const CheckIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M5 12.5l4 4 10-10" />
  </svg>
)
