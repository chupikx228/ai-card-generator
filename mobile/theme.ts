import { colors } from '@shared/theme/colors'

export { colors }

export const fonts = {
  serif: 'Literata_600SemiBold',
  serifMedium: 'Literata_500Medium',
  sans: 'Manrope_500Medium',
  sansSemi: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
} as const

export const shadow = {
  shadowColor: colors.foreground,
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const

export const lift = {
  shadowColor: colors.foreground,
  shadowOpacity: 0.14,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
} as const

export const overlay = 'rgba(11, 13, 18, 0.28)'
