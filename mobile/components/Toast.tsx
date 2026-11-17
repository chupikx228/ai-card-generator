import { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import type { Notice } from '../model/notice'
import { colors, fonts, lift } from '../theme'

const VISIBLE_MS = 2400

export const Toast = ({ notice, bottom }: { notice: Notice | null; bottom: number }) => {
  const progress = useRef(new Animated.Value(0)).current
  const [shown, setShown] = useState<Notice | null>(null)

  useEffect(() => {
    if (!notice) {
      return
    }
    setShown(notice)
    Animated.timing(progress, { toValue: 1, duration: 180, useNativeDriver: true }).start()
    const timer = setTimeout(() => {
      Animated.timing(progress, { toValue: 0, duration: 220, useNativeDriver: true }).start()
    }, VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [notice, progress])

  if (!shown) {
    return null
  }

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        { bottom },
        shown.tone === 'error' ? styles.error : styles.success,
        { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
      ]}
    >
      {shown.tone === 'success' ? <View style={styles.dot} /> : null}
      <Text style={styles.text}>{shown.text}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    maxWidth: '88%',
    ...lift,
  },
  success: {
    backgroundColor: colors.foreground,
  },
  error: {
    backgroundColor: colors.danger,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  text: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.surface,
  },
})
