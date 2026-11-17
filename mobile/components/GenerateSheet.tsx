import { useEffect, useRef, useState } from 'react'
import { Animated, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import {
  CARD_COUNT_OPTIONS,
  type DeckLanguage,
  deckToStudyCards,
  getGenerationErrorMessage,
  pickDistinct,
  TOPIC_LIMITS,
} from '@shared/decks'
import { pluralCards } from '@shared/study-cards'
import type { CardDraft, DeckSummary } from '@shared/storage'
import { generateDeck, loadSettings, saveSettings } from '../api/generate'
import { colors, fonts } from '../theme'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { fieldStyle } from './Composer'
import { DeckPicker } from './DeckPicker'
import { PreviewDraft, type PreviewDraftItem } from './PreviewDraft'
import { Sparkles } from './Sparkles'

type GenerateSheetProps = {
  decks: DeckSummary[]
  defaultDeckId: string | null
  onSave: (drafts: CardDraft[], deckId: string | null, newDeckTitle: string) => string | null
  onSaved: (deckId: string) => void
  onClose: () => void
}

type Stage =
  | { name: 'form'; error: string | null }
  | { name: 'loading' }
  | { name: 'preview'; title: string; drafts: PreviewDraftItem[]; fromCache: boolean }

const NEW_DECK = 'new'
const SLOW_HINT_MS = 6000
const REGENERATE_EMPTY = 'ШІ повернув лише схожі картки. Спробуйте ще раз.'

const LANGUAGES: Array<{ id: DeckLanguage; label: string }> = [
  { id: 'uk', label: 'Українська' },
  { id: 'en', label: 'English' },
]

const Chip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <Pressable
    accessibilityRole="radio"
    accessibilityState={{ selected: active }}
    onPress={onPress}
    style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
)

const Loading = ({ subject, slow }: { subject: string; slow: boolean }) => {
  const pulse = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] })

  return (
    <View style={styles.loading} accessibilityLiveRegion="polite">
      <View style={styles.loadingCards}>
        <Animated.View style={[styles.loadingBack, { opacity }]} />
        <Animated.View style={[styles.loadingFront, { opacity }]} />
      </View>
      <Text style={styles.loadingTitle}>Готую картки про «{subject.trim()}»</Text>
      <Text style={[styles.loadingHint, !slow && styles.hidden]}>
        Сервер прокидається після простою, тому перший запит може тривати до хвилини.
      </Text>
    </View>
  )
}

export const GenerateSheet = ({ decks, defaultDeckId, onSave, onSaved, onClose }: GenerateSheetProps) => {
  const [settings] = useState(loadSettings)
  const [subject, setSubject] = useState(settings.topic)
  const [count, setCount] = useState(settings.count)
  const [language, setLanguage] = useState<DeckLanguage>(settings.language)
  const [target, setTarget] = useState(defaultDeckId ?? NEW_DECK)
  const [stage, setStage] = useState<Stage>({ name: 'form', error: null })
  const [slow, setSlow] = useState(false)
  const [editingKey, setEditingKey] = useState<number | null>(null)
  const requests = useRef(new Set<AbortController>())

  const abortAll = () => {
    requests.current.forEach((controller) => controller.abort())
    requests.current.clear()
  }

  const startRequest = (): AbortController => {
    const controller = new AbortController()
    requests.current.add(controller)
    return controller
  }

  const finishRequest = (controller: AbortController): boolean => {
    requests.current.delete(controller)
    return !controller.signal.aborted
  }

  useEffect(() => abortAll, [])

  useEffect(() => {
    if (stage.name !== 'loading') {
      setSlow(false)
      return
    }
    const timer = setTimeout(() => setSlow(true), SLOW_HINT_MS)
    return () => clearTimeout(timer)
  }, [stage.name])

  const generate = async (fresh: boolean) => {
    if (subject.trim().length < TOPIC_LIMITS.minLength) {
      setStage({ name: 'form', error: `Опишіть тему хоча б ${TOPIC_LIMITS.minLength} символами.` })
      return
    }
    saveSettings({ topic: subject.trim(), count, language })
    abortAll()
    const controller = startRequest()
    setEditingKey(null)
    setStage({ name: 'loading' })
    const result = await generateDeck({ topic: subject, mode: 'qa', language, count }, fresh, controller.signal)
    if (!finishRequest(controller)) {
      return
    }
    if (!result.ok) {
      setStage({ name: 'form', error: getGenerationErrorMessage(result.code) })
      return
    }
    const drafts = deckToStudyCards(result.deck, 'Інше').map((card, index) => ({
      question: card.question,
      answer: card.answer,
      key: index,
      selected: true,
      busy: false,
      error: null,
    }))
    setStage({ name: 'preview', title: result.deck.title, drafts, fromCache: result.fromCache })
  }

  const updateDraft = (key: number, change: (draft: PreviewDraftItem) => PreviewDraftItem) =>
    setStage((current) =>
      current.name === 'preview'
        ? { ...current, drafts: current.drafts.map((draft) => (draft.key === key ? change(draft) : draft)) }
        : current,
    )

  const regenerateDraft = async (key: number) => {
    if (stage.name !== 'preview') {
      return
    }
    const taken = stage.drafts.map((draft) => draft.question)
    const controller = startRequest()
    updateDraft(key, (draft) => ({ ...draft, busy: true, error: null }))
    const result = await generateDeck(
      { topic: subject, mode: 'qa', language, count: CARD_COUNT_OPTIONS[0] },
      true,
      controller.signal,
    )
    if (!finishRequest(controller)) {
      return
    }
    if (!result.ok) {
      updateDraft(key, (draft) => ({ ...draft, busy: false, error: getGenerationErrorMessage(result.code) }))
      return
    }
    const fresh = pickDistinct(deckToStudyCards(result.deck, 'Інше'), taken)
    updateDraft(key, (draft) =>
      fresh
        ? { ...draft, question: fresh.question, answer: fresh.answer, selected: true, busy: false, error: null }
        : { ...draft, busy: false, error: REGENERATE_EMPTY },
    )
  }

  const save = () => {
    if (stage.name !== 'preview') {
      return
    }
    const chosen = stage.drafts.filter((draft) => draft.selected).map(({ question, answer }) => ({ question, answer }))
    const deckId = onSave(chosen, target === NEW_DECK ? null : target, stage.title)
    if (deckId) {
      onSaved(deckId)
      onClose()
    }
  }

  const selectedCount = stage.name === 'preview' ? stage.drafts.filter((draft) => draft.selected).length : 0
  const pending = editingKey !== null || (stage.name === 'preview' && stage.drafts.some((draft) => draft.busy))
  const targetOptions = [
    { value: NEW_DECK, label: stage.name === 'preview' ? `Нова колода «${stage.title}»` : 'Нова колода' },
    ...decks.map((deck) => ({ value: deck.id, label: deck.title })),
  ]

  return (
    <BottomSheet onClose={onClose}>
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Sparkles color={colors.accent} size={18} />
            <Text style={styles.title} accessibilityRole="header">
              Згенерувати картки
            </Text>
          </View>
          <Button label="Закрити" variant="ghost" size="sm" onPress={onClose} />
        </View>

        {stage.name === 'preview' ? (
          <>
            <View style={styles.previewHead}>
              <Text style={styles.deckTitle} numberOfLines={2}>
                {stage.title}
              </Text>
              <Text style={styles.selected}>
                Обрано {selectedCount} з {stage.drafts.length}
              </Text>
            </View>
            {stage.fromCache ? (
              <Text style={styles.cacheNote}>Ці картки вже генерувалися раніше й відкрилися миттєво. Натисніть «Згенерувати інші», щоб отримати нові.</Text>
            ) : null}
            <FlatList
              style={styles.flexibleList}
              data={stage.drafts}
              keyExtractor={(draft) => String(draft.key)}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <PreviewDraft
                  draft={item}
                  editing={editingKey === item.key}
                  onToggle={(key) => updateDraft(key, (draft) => ({ ...draft, selected: !draft.selected }))}
                  onStartEdit={setEditingKey}
                  onCancelEdit={() => setEditingKey(null)}
                  onSave={(key, next) => {
                    updateDraft(key, (draft) => ({ ...draft, ...next, selected: true, error: null }))
                    setEditingKey(null)
                  }}
                  onRegenerate={(key) => void regenerateDraft(key)}
                />
              )}
            />
            <View style={styles.footer}>
              <DeckPicker label="Куди" value={target} options={targetOptions} onChange={setTarget} />
              <View style={styles.footerRow}>
                <Button label="Згенерувати інші" variant="outline" onPress={() => void generate(true)} style={styles.flex} />
                <Button
                  label={`Додати ${pluralCards(selectedCount)}`}
                  onPress={save}
                  disabled={selectedCount === 0 || pending}
                  style={styles.flex}
                />
              </View>
            </View>
          </>
        ) : stage.name === 'loading' ? (
          <Loading subject={subject} slow={slow} />
        ) : (
          <ScrollView style={styles.flexibleList} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={styles.lead}>Опишіть тему, і ШІ збере колоду з питань і відповідей. Перед збереженням її можна переглянути.</Text>
            <Text style={styles.label}>Тема</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Наприклад: столиці Європи"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Тема"
              maxLength={TOPIC_LIMITS.maxLength}
              multiline
              autoFocus={!subject}
              style={[fieldStyle, styles.topic, stage.error !== null && styles.invalid]}
            />
            {stage.error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {stage.error}
              </Text>
            ) : null}
            <Text style={styles.label}>Кількість карток</Text>
            <View style={styles.chips}>
              {CARD_COUNT_OPTIONS.map((option) => (
                <Chip key={option} label={String(option)} active={count === option} onPress={() => setCount(option)} />
              ))}
            </View>
            <Text style={styles.label}>Мова</Text>
            <View style={styles.chips}>
              {LANGUAGES.map((item) => (
                <Chip key={item.id} label={item.label} active={language === item.id} onPress={() => setLanguage(item.id)} />
              ))}
            </View>
            <Button
              label="Згенерувати"
              icon={<Sparkles color={colors.primaryForeground} size={15} />}
              onPress={() => void generate(false)}
              style={styles.submit}
            />
          </ScrollView>
        )}
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  flexibleList: {
    flexGrow: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 12,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.foreground,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  lead: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginBottom: 6,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.muted,
    marginTop: 10,
  },
  topic: {
    height: undefined,
    minHeight: 84,
    paddingTop: 13,
    paddingBottom: 13,
    textAlignVertical: 'top',
  },
  invalid: {
    borderColor: colors.danger,
  },
  error: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.danger,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipIdle: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.primary,
  },
  submit: {
    marginTop: 22,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 36,
    gap: 18,
  },
  loadingCards: {
    width: 150,
    height: 100,
  },
  loadingBack: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 138, 76, 0.3)',
    transform: [{ rotate: '8deg' }, { translateX: 14 }],
  },
  loadingFront: {
    ...StyleSheet.absoluteFill,
    borderRadius: 18,
    backgroundColor: 'rgba(91, 75, 247, 0.8)',
  },
  loadingTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    textAlign: 'center',
    color: colors.foreground,
  },
  loadingHint: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.muted,
  },
  hidden: {
    opacity: 0,
  },
  previewHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deckTitle: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.foreground,
  },
  selected: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.muted,
  },
  cacheNote: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
    paddingHorizontal: 10,
  },
})
