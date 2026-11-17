import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../theme'

export const DeckGlyph = ({ size = 28, complete = false }: { size?: number; complete?: boolean }) => (
  <View style={{ width: size, height: size }}>
    <View
      style={[
        styles.back,
        { width: size * 0.62, height: size * 0.46, borderRadius: size * 0.12, left: size * 0.28, top: size * 0.12 },
      ]}
    />
    <View
      style={[
        styles.front,
        {
          width: size * 0.7,
          height: size * 0.52,
          borderRadius: size * 0.13,
          left: size * 0.12,
          top: size * 0.36,
          backgroundColor: complete ? colors.success : colors.primary,
        },
      ]}
    />
  </View>
)

export const Logo = () => (
  <View style={styles.row} accessibilityRole="header">
    <DeckGlyph size={30} />
    <Text style={styles.word}>Deckly</Text>
  </View>
)

const styles = StyleSheet.create({
  back: {
    position: 'absolute',
    backgroundColor: colors.accent,
    transform: [{ rotate: '8deg' }],
  },
  front: {
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  word: {
    fontFamily: fonts.serif,
    fontSize: 25,
    color: colors.foreground,
    letterSpacing: -0.2,
  },
})
