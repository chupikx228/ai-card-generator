import { useEffect, useRef } from 'react'
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native'
import { colors, fonts } from '../theme'

type SplashProps = {
  onReady: () => void
  onFinish: () => void
}

const WORD = 'Deckly'
const GLYPH = 84
const GLOW_RINGS = [
  { size: 380, opacity: 0.05 },
  { size: 300, opacity: 0.06 },
  { size: 230, opacity: 0.08 },
  { size: 170, opacity: 0.1 },
]

const spring = (value: Animated.Value, toValue: number, delay = 0) =>
  Animated.sequence([
    Animated.delay(delay),
    Animated.spring(value, { toValue, friction: 5, tension: 70, useNativeDriver: true }),
  ])

const timing = (value: Animated.Value, toValue: number, duration: number, easing = Easing.out(Easing.cubic)) =>
  Animated.timing(value, { toValue, duration, easing, useNativeDriver: true })

export const Splash = ({ onReady, onFinish }: SplashProps) => {
  const front = useRef(new Animated.Value(0)).current
  const back = useRef(new Animated.Value(0)).current
  const letters = useRef(WORD.split('').map(() => new Animated.Value(0))).current
  const jump = useRef(new Animated.Value(0)).current
  const glow = useRef(new Animated.Value(0)).current
  const exit = useRef(new Animated.Value(0)).current

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const reduced = await AccessibilityInfo.isReduceMotionEnabled()
      if (cancelled) {
        return
      }
      if (reduced) {
        for (const value of [front, back, ...letters]) {
          value.setValue(1)
        }
        Animated.sequence([Animated.delay(500), timing(exit, 1, 250)]).start(() => onFinish())
        return
      }
      Animated.sequence([
        Animated.parallel([
          spring(front, 1),
          spring(back, 1, 160),
          Animated.stagger(
            55,
            letters.map((value) => spring(value, 1, 260)),
          ),
        ]),
        Animated.parallel([
          Animated.sequence([
            timing(jump, -1, 220),
            Animated.spring(jump, { toValue: 0, friction: 4, tension: 90, useNativeDriver: true }),
          ]),
          Animated.sequence([timing(glow, 1, 380), Animated.delay(700), timing(glow, 0, 600, Easing.inOut(Easing.quad))]),
        ]),
        Animated.delay(150),
        timing(exit, 1, 320, Easing.in(Easing.cubic)),
      ]).start(() => onFinish())
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [front, back, letters, jump, glow, exit, onFinish])

  const lift = jump.interpolate({ inputRange: [-1, 0], outputRange: [-22, 0] })
  const pop = jump.interpolate({ inputRange: [-1, 0], outputRange: [1.08, 1] })

  return (
    <Animated.View
      onLayout={onReady}
      pointerEvents="none"
      accessibilityLabel="Deckly"
      style={[
        styles.screen,
        {
          opacity: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [{ scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.glowWrap,
          {
            opacity: glow,
            transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] }) }],
          },
        ]}
      >
        {GLOW_RINGS.map((ring) => (
          <View
            key={ring.size}
            style={[styles.ring, { width: ring.size, height: ring.size, borderRadius: ring.size / 2, opacity: ring.opacity }]}
          />
        ))}
      </Animated.View>
      <Animated.View style={[styles.brand, { transform: [{ translateY: lift }, { scale: pop }] }]}>
        <View style={styles.glyph}>
          <Animated.View
            style={[
              styles.back,
              {
                opacity: back,
                transform: [
                  { translateX: back.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
                  { rotate: back.interpolate({ inputRange: [0, 1], outputRange: ['-24deg', '8deg'] }) },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.front,
              {
                transform: [
                  { translateY: front.interpolate({ inputRange: [0, 1], outputRange: [-260, 0] }) },
                  { rotate: front.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '0deg'] }) },
                ],
              },
            ]}
          />
        </View>
        <View style={styles.word}>
          {WORD.split('').map((letter, index) => (
            <Animated.Text
              key={`${letter}-${index}`}
              style={[
                styles.letter,
                {
                  opacity: letters[index],
                  transform: [{ translateY: letters[index].interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  glowWrap: {
    position: 'absolute',
    width: 380,
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    backgroundColor: colors.primary,
  },
  brand: {
    alignItems: 'center',
    gap: 18,
  },
  glyph: {
    width: GLYPH,
    height: GLYPH,
  },
  back: {
    position: 'absolute',
    left: GLYPH * 0.28,
    top: GLYPH * 0.1,
    width: GLYPH * 0.62,
    height: GLYPH * 0.46,
    borderRadius: GLYPH * 0.12,
    backgroundColor: colors.accent,
  },
  front: {
    position: 'absolute',
    left: GLYPH * 0.12,
    top: GLYPH * 0.36,
    width: GLYPH * 0.7,
    height: GLYPH * 0.52,
    borderRadius: GLYPH * 0.13,
    backgroundColor: colors.primary,
  },
  word: {
    flexDirection: 'row',
  },
  letter: {
    fontFamily: fonts.serif,
    fontSize: 44,
    lineHeight: 52,
    color: colors.foreground,
    letterSpacing: -0.6,
  },
})
