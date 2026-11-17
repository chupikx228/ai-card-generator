import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { pluralCards } from '@shared/study-cards'
import { colors, fonts } from '../theme'
import { Button } from './Button'
import { ConfirmDialog } from './ConfirmDialog'

type DeckHeaderProps = {
  title: string
  count: number
  editable: boolean
  onRename: (title: string) => string | null
  onDelete: () => void
}

export const DeckHeader = ({ title, count, editable, onRename, onDelete }: DeckHeaderProps) => {
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(title)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const save = () => {
    const result = onRename(draft)
    setError(result)
    if (!result) {
      setRenaming(false)
    }
  }


  if (renaming) {
    return (
      <View style={styles.block}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={save}
          accessibilityLabel="Назва колоди"
          autoFocus
          returnKeyType="done"
          style={styles.input}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <Button label="Скасувати" variant="ghost" size="sm" onPress={() => {
            setRenaming(false)
            setDraft(title)
            setError(null)
          }} />
          <Button label="Зберегти" size="sm" onPress={save} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.block}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.count}>{pluralCards(count)}</Text>
        {editable ? (
          <View style={styles.actions}>
            <Button label="Перейменувати" variant="ghost" size="sm" onPress={() => {
              setDraft(title)
              setRenaming(true)
            }} />
            <Button label="Видалити" variant="ghost" size="sm" onPress={() => setConfirming(true)} />
          </View>
        ) : null}
      </View>
      {confirming ? (
        <ConfirmDialog
          title={`Видалити колоду «${title}»?`}
          message={`Разом із колодою буде видалено ${pluralCards(count)}. Цю дію не можна скасувати.`}
          confirmLabel="Видалити"
          onConfirm={() => {
            setConfirming(false)
            onDelete()
          }}
          onClose={() => setConfirming(false)}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    gap: 4,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 36,
    color: colors.foreground,
    letterSpacing: -0.4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: -10,
  },
  input: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.foreground,
  },
  error: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.danger,
  },
})
