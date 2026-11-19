import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { CardDraft } from '@deckly/shared/storage'
import { colors, fonts } from '../theme'
import { BottomSheet } from './BottomSheet'
import { PlusIcon } from './PlusIcon'
import { Composer } from './Composer'
import type { PickerOption } from './DeckPicker'

type AddCardDialogProps = {
  deckTitle?: string
  deckOptions?: PickerOption[]
  onAdd: (draft: CardDraft, deckId: string | null) => string | null
  onClose: () => void
}

export const AddCardDialog = ({ deckTitle, deckOptions, onAdd, onClose }: AddCardDialogProps) => (
  <BottomSheet onClose={onClose}>
    <View style={styles.body}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Нова картка
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Закрити" onPress={onClose} hitSlop={10} style={styles.close}>
          <View style={styles.closeIcon}>
            <PlusIcon size={16} thickness={2} color={colors.muted} />
          </View>
        </Pressable>
      </View>
      {deckTitle ? <Text style={styles.subtitle}>У колоду «{deckTitle}»</Text> : null}
      <Composer
        framed={false}
        autoFocus
        deckOptions={deckOptions}
        onAdd={(draft, deckId) => {
          const error = onAdd(draft, deckId)
          if (!error) {
            onClose()
          }
          return error
        }}
      />
    </View>
  </BottomSheet>
)

const styles = StyleSheet.create({
  body: {
    gap: 6,
    paddingHorizontal: 20,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    transform: [{ rotate: '45deg' }],
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.foreground,
  },
  subtitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
})
