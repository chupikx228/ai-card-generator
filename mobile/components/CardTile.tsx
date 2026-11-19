import { memo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { StudyCard } from '@deckly/shared/study-cards'
import { colors, fonts } from '../theme'
import { CardActions } from './CardActions'
import { AnswerFace, QuestionFace } from './CardFaces'
import { Checkbox } from './Checkbox'
import { FlashCard } from './FlashCard'

type CardTileProps = {
  card: StudyCard
  label?: string
  onToggle: (card: StudyCard) => void
  onRemove: (card: StudyCard) => void
  onEdit: (card: StudyCard) => void
}

export const CardTile = memo(({ card, label, onToggle, onRemove, onEdit }: CardTileProps) => {
  const [flipped, setFlipped] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <View style={styles.tile}>
      <FlashCard
        style={styles.card}
        flipped={flipped}
        onFlip={() => setFlipped((value) => !value)}
        label={flipped ? `Відповідь: ${card.answer}` : `Питання: ${card.question}. Торкніться, щоб побачити відповідь`}
        front={<QuestionFace label={label} question={card.question} learned={card.learned} />}
        back={<AnswerFace answer={card.answer} />}
      />
      <View style={styles.actions}>
        <Checkbox checked={card.learned} onToggle={() => onToggle(card)} label="Вивчено" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Дії з карткою"
          onPress={() => setMenuOpen(true)}
          hitSlop={10}
          style={({ pressed }) => [styles.more, pressed && styles.morePressed]}
        >
          <Text style={styles.moreText}>•••</Text>
        </Pressable>
      </View>
      {menuOpen ? (
        <CardActions
          card={card}
          onClose={() => setMenuOpen(false)}
          onEdit={() => {
            setMenuOpen(false)
            onEdit(card)
          }}
          onDelete={() => {
            setMenuOpen(false)
            onRemove(card)
          }}
        />
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  tile: {
    width: '50%',
    gap: 8,
    paddingHorizontal: 7,
  },
  card: {
    aspectRatio: 0.92,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    minHeight: 28,
  },
  more: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  morePressed: {
    backgroundColor: colors.border,
  },
  moreText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.muted,
    letterSpacing: 1,
  },
})
