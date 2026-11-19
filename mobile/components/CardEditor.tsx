import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import type { StudyCard } from '@deckly/shared/study-cards'
import type { CardDraft } from '@deckly/shared/storage'
import { colors, fonts } from '../theme'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { fieldStyle } from './Composer'
import { DeckPicker, type PickerOption } from './DeckPicker'

type CardEditorProps = {
  card: StudyCard
  deckOptions: PickerOption[]
  onSave: (draft: CardDraft, deckId: string) => string | null
  onClose: () => void
}

export const CardEditor = ({ card, deckOptions, onSave, onClose }: CardEditorProps) => {
  const [question, setQuestion] = useState(card.question)
  const [answer, setAnswer] = useState(card.answer)
  const [deckId, setDeckId] = useState(card.deckId ?? deckOptions[0]?.value ?? '')
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    const result = onSave({ question, answer }, deckId)
    setError(result)
    if (!result) {
      onClose()
    }
  }

  return (
    <BottomSheet onClose={onClose}>
      <Text style={styles.title} accessibilityRole="header">
        Редагувати картку
      </Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Питання</Text>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          multiline
          accessibilityLabel="Питання"
          style={[fieldStyle, styles.area, styles.questionArea]}
        />
        <Text style={styles.label}>Відповідь</Text>
        <TextInput value={answer} onChangeText={setAnswer} multiline accessibilityLabel="Відповідь" style={[fieldStyle, styles.area]} />
        {deckOptions.length > 1 ? (
          <View style={styles.picker}>
            <DeckPicker label="Колода" value={deckId} options={deckOptions} onChange={setDeckId} />
          </View>
        ) : null}
        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Скасувати" variant="outline" onPress={onClose} style={styles.flex} />
        <Button label="Зберегти" onPress={save} style={styles.flex} />
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.foreground,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  scroll: {
    flexGrow: 0,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
  },
  area: {
    height: undefined,
    minHeight: 64,
    paddingTop: 13,
    paddingBottom: 13,
    textAlignVertical: 'top',
  },
  questionArea: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
  },
  picker: {
    marginTop: 10,
  },
  error: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.danger,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  flex: {
    flex: 1,
  },
})
