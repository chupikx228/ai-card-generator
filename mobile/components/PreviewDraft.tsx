import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { validateCard } from '@deckly/shared/study-cards'
import type { CardDraft } from '@deckly/shared/storage'
import { colors, fonts } from '../theme'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { fieldStyle } from './Composer'

export type PreviewDraftItem = CardDraft & {
  key: number
  selected: boolean
  busy: boolean
  error: string | null
}

type PreviewDraftProps = {
  draft: PreviewDraftItem
  editing: boolean
  onToggle: (key: number) => void
  onStartEdit: (key: number) => void
  onCancelEdit: () => void
  onSave: (key: number, draft: CardDraft) => void
  onRegenerate: (key: number) => void
}

const IconButton = ({ label, glyph, onPress, disabled }: { label: string; glyph: string; onPress: () => void; disabled?: boolean }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    disabled={disabled}
    hitSlop={6}
    style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}
  >
    <Text style={styles.iconGlyph}>{glyph}</Text>
  </Pressable>
)

const DraftEditor = ({ draft, onSave, onCancel }: { draft: PreviewDraftItem; onSave: (draft: CardDraft) => void; onCancel: () => void }) => {
  const [question, setQuestion] = useState(draft.question)
  const [answer, setAnswer] = useState(draft.answer)
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    const result = validateCard({ question, answer, topic: 'Інше', dueDate: '' })
    setError(result)
    if (!result) {
      onSave({ question: question.trim(), answer: answer.trim() })
    }
  }

  return (
    <View style={[styles.item, styles.editing]}>
      <TextInput value={question} onChangeText={setQuestion} multiline autoFocus accessibilityLabel="Питання" style={[fieldStyle, styles.area, styles.questionArea]} />
      <TextInput value={answer} onChangeText={setAnswer} multiline accessibilityLabel="Відповідь" style={[fieldStyle, styles.area]} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.editActions}>
        <Button label="Скасувати" variant="ghost" size="sm" onPress={onCancel} />
        <Button label="Зберегти" size="sm" onPress={save} />
      </View>
    </View>
  )
}

export const PreviewDraft = ({ draft, editing, onToggle, onStartEdit, onCancelEdit, onSave, onRegenerate }: PreviewDraftProps) => {
  if (editing) {
    return <DraftEditor draft={draft} onSave={(next) => onSave(draft.key, next)} onCancel={onCancelEdit} />
  }

  return (
    <View>
      <View style={[styles.item, draft.selected ? styles.selected : styles.unselected, draft.busy && styles.busy]}>
        <Checkbox checked={draft.selected} onToggle={() => onToggle(draft.key)} tint={colors.primary} />
        <Pressable style={styles.text} onPress={() => onToggle(draft.key)} accessibilityLabel={draft.question}>
          <Text style={styles.question}>{draft.question}</Text>
          <Text style={styles.answer}>{draft.answer}</Text>
        </Pressable>
        <View style={styles.tools}>
          <IconButton label="Редагувати" glyph="✎" onPress={() => onStartEdit(draft.key)} disabled={draft.busy} />
          {draft.busy ? (
            <View style={styles.icon}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <IconButton label="Згенерувати іншу картку" glyph="↻" onPress={() => onRegenerate(draft.key)} />
          )}
        </View>
      </View>
      {draft.error ? <Text style={[styles.error, styles.itemError]}>{draft.error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 6,
  },
  selected: {
    borderColor: 'rgba(91, 75, 247, 0.35)',
    backgroundColor: 'rgba(239, 237, 254, 0.7)',
  },
  unselected: {
    borderColor: colors.border,
    opacity: 0.6,
  },
  busy: {
    opacity: 0.5,
  },
  editing: {
    flexDirection: 'column',
    borderColor: 'rgba(91, 75, 247, 0.35)',
    backgroundColor: 'rgba(239, 237, 254, 0.4)',
    paddingRight: 14,
    gap: 8,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  question: {
    fontFamily: fonts.serifMedium,
    fontSize: 16,
    lineHeight: 21,
    color: colors.foreground,
  },
  answer: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 19,
    color: colors.muted,
  },
  tools: {
    gap: 2,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: {
    backgroundColor: colors.surface,
  },
  iconGlyph: {
    fontSize: 17,
    color: colors.muted,
  },
  area: {
    height: undefined,
    minHeight: 48,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.surface,
  },
  questionArea: {
    fontFamily: fonts.serifMedium,
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  error: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.danger,
  },
  itemError: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },
})
