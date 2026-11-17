import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from '../theme'

type FaceSize = 'md' | 'lg'

const LONG_TEXT = 140

const textSize = (text: string, size: FaceSize) => {
  const long = text.length > LONG_TEXT
  return size === 'lg' ? { fontSize: long ? 22 : 27, lineHeight: long ? 30 : 36 } : { fontSize: long ? 14 : 15, lineHeight: long ? 19 : 21 }
}

type FaceTextProps = {
  text: string
  size: FaceSize
  scroll: boolean
  color: string
  onPress?: () => void
  arrowColor: string
}

const FaceText = ({ text, size, scroll, color, onPress, arrowColor }: FaceTextProps) => {
  const [box, setBox] = useState({ view: 0, content: 0, offset: 0 })
  const style = [styles.text, textSize(text, size), { color }]

  if (!scroll) {
    return (
      <View style={styles.center}>
        <Text style={style} numberOfLines={size === 'lg' ? 7 : 5}>
          {text}
        </Text>
      </View>
    )
  }

  const more = box.content > box.view + 4 && box.offset + box.view < box.content - 4

  return (
    <View style={styles.scrollWrap}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          const view = event.nativeEvent.layout.height
          setBox((value) => ({ ...value, view }))
        }}
        onContentSizeChange={(_width, content) => setBox((value) => ({ ...value, content }))}
        onScroll={(event) => {
          const offset = event.nativeEvent.contentOffset.y
          setBox((value) => ({ ...value, offset }))
        }}
        scrollEventThrottle={32}
      >
        <Pressable onPress={onPress} style={styles.pressArea}>
          <Text style={style}>{text}</Text>
        </Pressable>
      </ScrollView>
      {more ? (
        <View pointerEvents="none" style={[styles.arrow, { borderColor: arrowColor }]}>
          <Text style={[styles.arrowGlyph, { color: arrowColor }]}>↓</Text>
        </View>
      ) : null}
    </View>
  )
}

type QuestionFaceProps = {
  label?: string
  question: string
  learned?: boolean
  hint?: string
  size?: FaceSize
  scroll?: boolean
  onPress?: () => void
}

export const QuestionFace = ({ label, question, learned = false, hint, size = 'md', scroll = false, onPress }: QuestionFaceProps) => (
  <View style={[styles.face, size === 'lg' ? styles.large : styles.medium]}>
    <View style={styles.top}>
      <Text style={styles.label} numberOfLines={1}>
        {label ?? ''}
      </Text>
      {learned ? <Text style={styles.badge}>Вивчено</Text> : null}
    </View>
    <FaceText
      text={question}
      size={size}
      scroll={scroll}
      onPress={onPress}
      color={learned ? 'rgba(11, 13, 18, 0.5)' : colors.foreground}
      arrowColor={colors.muted}
    />
    {hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>
)

type AnswerFaceProps = {
  answer: string
  size?: FaceSize
  scroll?: boolean
  onPress?: () => void
}

export const AnswerFace = ({ answer, size = 'md', scroll = false, onPress }: AnswerFaceProps) => (
  <View style={[styles.face, size === 'lg' ? styles.large : styles.medium]}>
    <Text style={styles.answerLabel}>Відповідь</Text>
    <FaceText text={answer} size={size} scroll={scroll} onPress={onPress} color={colors.primaryForeground} arrowColor="rgba(255,255,255,0.8)" />
  </View>
)

const styles = StyleSheet.create({
  face: {
    flex: 1,
  },
  medium: {
    padding: 12,
  },
  large: {
    padding: 26,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 22,
  },
  label: {
    flex: 1,
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.muted,
  },
  badge: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.success,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  answerLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.72)',
    minHeight: 22,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.serifMedium,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
  },
  scrollWrap: {
    flex: 1,
    marginVertical: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  pressArea: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  arrow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGlyph: {
    fontSize: 15,
    fontWeight: '700',
  },
})
