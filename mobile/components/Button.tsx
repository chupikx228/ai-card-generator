import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'
import { colors, fonts } from '../theme'

type Variant = 'primary' | 'dark' | 'ghost' | 'soft' | 'accent' | 'outline' | 'success' | 'danger'

type ButtonProps = {
  label: string
  onPress: () => void
  variant?: Variant
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  style?: StyleProp<ViewStyle>
  size?: 'md' | 'sm'
}

const backgrounds: Record<Variant, string> = {
  primary: colors.primary,
  dark: colors.foreground,
  ghost: 'transparent',
  soft: colors.primarySoft,
  accent: '#fff1e9',
  outline: colors.surface,
  success: colors.success,
  danger: colors.danger,
}

const foregrounds: Record<Variant, string> = {
  primary: colors.primaryForeground,
  dark: colors.surface,
  ghost: colors.muted,
  soft: colors.primary,
  accent: '#c4561d',
  outline: colors.foreground,
  success: colors.surface,
  danger: colors.surface,
}

export const Button = ({ label, onPress, variant = 'primary', disabled, loading, icon, style, size = 'md' }: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled: Boolean(disabled) }}
    onPress={onPress}
    disabled={disabled || loading}
    style={({ pressed }) => [
      styles.base,
      size === 'sm' ? styles.small : styles.medium,
      { backgroundColor: backgrounds[variant] },
      variant === 'outline' && styles.outline,
      (disabled || loading) && styles.disabled,
      pressed && styles.pressed,
      style,
    ]}
  >
    {loading ? <ActivityIndicator color={foregrounds[variant]} /> : icon}
    <Text style={[styles.label, size === 'sm' && styles.smallLabel, { color: foregrounds[variant] }]} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  medium: {
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  small: {
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
  },
  smallLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
  },
})
