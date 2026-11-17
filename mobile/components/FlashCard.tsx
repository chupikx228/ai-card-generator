import { type ReactNode, useEffect, useRef } from 'react'
import { Animated, Easing, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { colors, lift, shadow } from '../theme'

type FlashCardProps = {
  front: ReactNode
  back: ReactNode
  flipped: boolean
  onFlip: () => void
  label: string
  style?: StyleProp<ViewStyle>
  radius?: number
}

export const FlashCard = ({ front, back, flipped, onFlip, label, style, radius = 22 }: FlashCardProps) => {
  const progress = useRef(new Animated.Value(flipped ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue: flipped ? 1 : 0,
      duration: 460,
      easing: Easing.bezier(0.3, 0.7, 0.2, 1),
      useNativeDriver: true,
    }).start()
  }, [flipped, progress])

  const frontRotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] })
  const backRotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] })

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded: flipped }}
      onPress={onFlip}
      style={style}
    >
      <Animated.View
        pointerEvents={flipped ? 'none' : 'auto'}
        style={[styles.face, styles.front, { borderRadius: radius, transform: [{ perspective: 1200 }, { rotateY: frontRotate }] }]}
      >
        {front}
      </Animated.View>
      <Animated.View
        pointerEvents={flipped ? 'auto' : 'none'}
        style={[styles.face, styles.back, { borderRadius: radius, transform: [{ perspective: 1200 }, { rotateY: backRotate }] }]}
      >
        {back}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  face: {
    ...StyleSheet.absoluteFill,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  front: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  back: {
    backgroundColor: colors.primary,
    ...lift,
  },
})
