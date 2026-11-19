import { type ComponentRef, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import type { DeckSummary, Scope } from '@deckly/shared/storage'
import { colors, fonts } from '../theme'
import { PlusIcon } from './PlusIcon'

type DeckBarProps = {
  decks: DeckSummary[]
  allTotal: number
  scope: Scope
  onScopeChange: (scope: Scope) => void
  onCreateDeck: (title: string) => string | null
}

const Chip = ({ label, count, active, onPress }: { label: string; count: number; active: boolean; onPress: () => void }) => (
  <Pressable
    accessibilityRole="tab"
    accessibilityState={{ selected: active }}
    onPress={onPress}
    style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
  >
    <Text style={[styles.chipLabel, active && styles.chipLabelActive]} numberOfLines={1}>
      {label}
    </Text>
    <Text style={[styles.chipCount, active && styles.chipCountActive]}>{count.toLocaleString('uk-UA')}</Text>
  </Pressable>
)

export const DeckBar = ({ decks, allTotal, scope, onScopeChange, onCreateDeck }: DeckBarProps) => {
  const [creating, setCreating] = useState(false)
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setCreating(false)
    setTitle('')
    setError(null)
  }

  const select = (next: Scope) => {
    close()
    onScopeChange(next)
  }

  const submit = () => {
    const result = onCreateDeck(title)
    if (result) {
      setError(result)
      return
    }
    close()
  }

  return (
    <View>
      <ScrollView
        ref={scroller}
        onContentSizeChange={() => (creating ? scroller.current?.scrollToEnd({ animated: true }) : undefined)}
        horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} keyboardShouldPersistTaps="handled">
        <Chip label="Усі картки" count={allTotal} active={scope.kind === 'all'} onPress={() => select({ kind: 'all' })} />
        {decks.map((deck) => (
          <Chip
            key={deck.id}
            label={deck.title}
            count={deck.total}
            active={scope.kind === 'deck' && scope.id === deck.id}
            onPress={() => select({ kind: 'deck', id: deck.id })}
          />
        ))}
        {creating ? (
          <View style={[styles.chip, styles.input]}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={submit}
              onBlur={close}
              submitBehavior="submit"
              placeholder="Назва колоди"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Назва нової колоди"
              returnKeyType="done"
              autoFocus
              style={styles.inputField}
            />
            <Pressable accessibilityRole="button" accessibilityLabel="Скасувати" onPress={close} hitSlop={10} style={styles.cancel}>
              <View style={styles.cancelIcon}>
                <PlusIcon size={12} thickness={2} color={colors.muted} />
              </View>
            </Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel="Нова колода" onPress={() => setCreating(true)} style={[styles.chip, styles.add]}>
            <Text style={styles.addLabel}>+ Нова колода</Text>
          </Pressable>
        )}
      </ScrollView>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 2,
  },
  chip: {
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    maxWidth: 240,
  },
  chipIdle: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.foreground,
  },
  chipLabel: {
    flexShrink: 1,
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.foreground,
  },
  chipLabelActive: {
    color: colors.surface,
  },
  chipCount: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.muted,
  },
  chipCountActive: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  add: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.muted,
  },
  input: {
    minWidth: 190,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    paddingRight: 8,
  },
  inputField: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.foreground,
  },
  cancel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelIcon: {
    transform: [{ rotate: '45deg' }],
  },
  error: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.danger,
    paddingHorizontal: 22,
    paddingTop: 6,
  },
})
