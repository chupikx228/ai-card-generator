import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { pluralCards, type StudyCard } from '@shared/study-cards'
import { colors, fonts } from '../theme'
import { Button } from './Button'
import { AnswerFace, QuestionFace } from './CardFaces'
import { FlashCard } from './FlashCard'

type StudySessionProps = {
  cards: StudyCard[]
  title: string
  labelFor: (card: StudyCard) => string | undefined
  onAnswer: (id: number, learned: boolean) => void
  onClose: () => void
}

export const StudySession = ({ cards, title, labelFor, onAnswer, onClose }: StudySessionProps) => {
  const insets = useSafeAreaInsets()
  const [queue] = useState(cards)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const card = queue[index]
  const finished = index >= queue.length

  const answer = (learned: boolean) => {
    if (!card) {
      return
    }
    onAnswer(card.id, learned)
    setKnown((value) => value + (learned ? 1 : 0))
    setFlipped(false)
    setIndex((value) => value + 1)
  }

  const flip = () => setFlipped((value) => !value)

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">
            Повторення
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Text style={styles.counter}>
          {Math.min(index + 1, queue.length)} з {queue.length}
        </Text>
        <Button label="Завершити" variant="outline" size="sm" onPress={onClose} />
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(index / Math.max(1, queue.length)) * 100}%` }]} />
      </View>

      {finished || !card ? (
        <View style={styles.done}>
          <Text style={styles.doneTitle}>Повторення завершено</Text>
          <Text style={styles.doneText}>
            Ви повторили {pluralCards(queue.length)}. Знаєте {known} з {queue.length}.
          </Text>
          <Button label="Повернутися до карток" onPress={onClose} style={styles.doneButton} />
        </View>
      ) : (
        <View style={styles.body}>
          <FlashCard
            key={card.id}
            style={styles.card}
            radius={28}
            flipped={flipped}
            onFlip={flip}
            label={flipped ? `Відповідь: ${card.answer}` : `Питання: ${card.question}`}
            front={
              <QuestionFace
                label={labelFor(card)}
                question={card.question}
                size="lg"
                scroll
                onPress={flip}
                hint="Торкніться картки, щоб перевернути"
              />
            }
            back={<AnswerFace answer={card.answer} size="lg" scroll onPress={flip} />}
          />
          <View style={styles.buttons}>
            <Button label="Ще раз" variant="outline" onPress={() => answer(false)} style={styles.flex} />
            <Button label="Знаю" variant="success" onPress={() => answer(true)} style={styles.flex} />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    color: colors.foreground,
  },
  subtitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.muted,
  },
  counter: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  card: {
    width: '100%',
    aspectRatio: 0.78,
    maxHeight: '75%',
    alignSelf: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  done: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  doneTitle: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.foreground,
    textAlign: 'center',
  },
  doneText: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
  doneButton: {
    marginTop: 12,
    alignSelf: 'stretch',
  },
})
