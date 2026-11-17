import { type ComponentRef, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import type { CardDraft } from '@shared/storage'
import { colors, fonts, shadow } from '../theme'
import { Button } from './Button'
import { DeckPicker, type PickerOption } from './DeckPicker'

type ComposerProps = {
  onAdd: (draft: CardDraft, deckId: string | null) => string | null
  deckOptions?: PickerOption[]
  autoFocus?: boolean
  framed?: boolean
}

export const fieldStyle = {
  height: 50,
  borderRadius: 14,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 14,
  fontFamily: fonts.sans,
  fontSize: 15,
  color: colors.foreground,
} as const

export const Composer = ({ onAdd, deckOptions, autoFocus = false, framed = true }: ComposerProps) => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [deckId, setDeckId] = useState(deckOptions?.[0]?.value ?? '')
  const [error, setError] = useState<string | null>(null)
  const questionRef = useRef<ComponentRef<typeof TextInput>>(null)
  const answerRef = useRef<ComponentRef<typeof TextInput>>(null)

  const submit = () => {
    const result = onAdd({ question, answer }, deckOptions ? deckId || null : null)
    setError(result)
    if (!result) {
      setQuestion('')
      setAnswer('')
      questionRef.current?.focus()
    }
  }

  return (
    <View style={[styles.box, framed && styles.framed]}>
      <TextInput
        ref={questionRef}
        value={question}
        onChangeText={setQuestion}
        placeholder="Питання"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Питання"
        returnKeyType="next"
        onSubmitEditing={() => answerRef.current?.focus()}
        submitBehavior="submit"
        autoFocus={autoFocus}
        style={[fieldStyle, error !== null && !question.trim() && styles.invalid]}
      />
      <TextInput
        ref={answerRef}
        value={answer}
        onChangeText={setAnswer}
        placeholder="Відповідь"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Відповідь"
        returnKeyType="done"
        onSubmitEditing={submit}
        style={[fieldStyle, error !== null && question.trim() !== '' && !answer.trim() && styles.invalid]}
      />
      {deckOptions && deckOptions.length > 0 ? (
        <DeckPicker label="Колода" value={deckId} options={deckOptions} onChange={setDeckId} />
      ) : null}
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Button label="Додати картку" onPress={submit} />
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    gap: 10,
  },
  framed: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadow,
  },
  invalid: {
    borderColor: colors.danger,
  },
  error: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.danger,
    paddingHorizontal: 2,
  },
})
