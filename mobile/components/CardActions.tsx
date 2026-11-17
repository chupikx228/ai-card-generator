import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { StudyCard } from '@shared/study-cards'
import { colors, fonts } from '../theme'
import { BottomSheet } from './BottomSheet'
import { ConfirmContent } from './ConfirmDialog'

type CardActionsProps = {
  card: StudyCard
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

const Action = ({ label, hint, onPress, danger = false }: { label: string; hint: string; onPress: () => void; danger?: boolean }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
  >
    <Text style={[styles.actionLabel, danger && styles.danger]}>{label}</Text>
    <Text style={styles.actionHint}>{hint}</Text>
  </Pressable>
)

export const CardActions = ({ card, onEdit, onDelete, onClose }: CardActionsProps) => {
  const [confirming, setConfirming] = useState(false)

  return (
    <BottomSheet onClose={onClose}>
      <View style={styles.body}>
        {confirming ? (
          <ConfirmContent
            title="Видалити картку?"
            message="Картку буде видалено з колоди назавжди. Цю дію не можна скасувати."
            confirmLabel="Видалити"
            onConfirm={onDelete}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <>
            <View style={styles.preview}>
              <Text style={styles.question} numberOfLines={2}>
                {card.question}
              </Text>
              <Text style={styles.answer} numberOfLines={1}>
                {card.answer}
              </Text>
            </View>
            <Action label="Редагувати" hint="Змінити питання, відповідь або колоду" onPress={onEdit} />
            <Action label="Видалити" hint="Прибрати картку з колоди" onPress={() => setConfirming(true)} danger />
          </>
        )}
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 20,
    gap: 8,
  },
  preview: {
    gap: 4,
    paddingBottom: 8,
  },
  question: {
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 26,
    color: colors.foreground,
  },
  answer: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
  },
  action: {
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 2,
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: colors.foreground,
  },
  danger: {
    color: colors.danger,
  },
  actionHint: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
  },
})
