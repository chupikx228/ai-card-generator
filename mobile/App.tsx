import { useCallback, useMemo, useState } from 'react'
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Literata_500Medium, Literata_600SemiBold } from '@expo-google-fonts/literata'
import { Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { CARD_MESSAGES, DECK_MESSAGES, DEFAULT_DECK_TITLE, pluralCards, type StudyCard } from '@shared/study-cards'
import type { CardDraft, Done, Scope } from '@shared/storage'
import { Button } from './components/Button'
import { CardEditor } from './components/CardEditor'
import { CardTile } from './components/CardTile'
import { AddCardDialog } from './components/AddCardDialog'
import { DeckBar } from './components/DeckBar'
import { DeckHeader } from './components/DeckHeader'
import { GenerateSheet } from './components/GenerateSheet'
import { Logo } from './components/Logo'
import { PlusIcon } from './components/PlusIcon'
import { Sparkles } from './components/Sparkles'
import { Splash } from './components/Splash'
import { StudySession } from './components/StudySession'
import { Toast } from './components/Toast'
import { Welcome } from './components/Welcome'
import { repository } from './db/database'
import type { Notice } from './model/notice'
import { useCardList, useDebouncedValue, useDecks, useStats } from './model/use-data'
import { colors, fonts, lift } from './theme'

void SplashScreen.preventAutoHideAsync()

const ALL: Scope = { kind: 'all' }
const STUDY_BATCH = 200

const Home = () => {
  const insets = useSafeAreaInsets()
  const [version, setVersion] = useState(0)
  const [scope, setScope] = useState<Scope>(ALL)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [studyCards, setStudyCards] = useState<StudyCard[] | null>(null)
  const [generating, setGenerating] = useState(false)
  const [editing, setEditing] = useState<StudyCard | null>(null)
  const [adding, setAdding] = useState(false)

  const decks = useDecks(version)
  const activeDeck = scope.kind === 'deck' ? decks.find((deck) => deck.id === scope.id) : undefined
  const effectiveScope: Scope = activeDeck ? scope : ALL
  const query = useDebouncedValue(search.trim())
  const stats = useStats(effectiveScope, version)
  const allStats = useStats(ALL, version)
  const cards = useCardList(effectiveScope, query, version)

  const deckTitles = useMemo(() => new Map(decks.map((deck) => [deck.id, deck.title])), [decks])
  const deckOptions = useMemo(() => decks.map((deck) => ({ value: deck.id, label: deck.title })), [decks])

  const notify = useCallback((text: string, tone: Notice['tone'] = 'success') => {
    setNotice({ id: Date.now(), text, tone })
  }, [])

  const run = useCallback(
    (result: Done, message?: string): string | null => {
      if (!result.ok) {
        notify(result.error, 'error')
        return result.error
      }
      setVersion((value) => value + 1)
      if (message) {
        notify(message)
      }
      return null
    },
    [notify],
  )

  const toggleCard = useCallback((card: StudyCard) => void run(repository.setLearned(card.id, !card.learned)), [run])
  const removeCard = useCallback((card: StudyCard) => void run(repository.removeCard(card.id), CARD_MESSAGES.deleted), [run])

  const addCard = (draft: CardDraft, deckId: string | null): string | null => {
    const result = repository.addCards(activeDeck?.id ?? deckId, DEFAULT_DECK_TITLE, [draft])
    if (!result.ok) {
      return result.error
    }
    setVersion((value) => value + 1)
    notify(CARD_MESSAGES.added)
    return null
  }

  const createDeck = (title: string): string | null => {
    const result = repository.createDeck(title)
    if (!result.ok) {
      return result.error
    }
    setVersion((value) => value + 1)
    notify(DECK_MESSAGES.created)
    setScope({ kind: 'deck', id: result.deck.id })
    return null
  }

  const saveGenerated = (drafts: CardDraft[], deckId: string | null, title: string): string | null => {
    const result = repository.addCards(deckId, title, drafts)
    if (!result.ok) {
      notify(result.error, 'error')
      return null
    }
    setVersion((value) => value + 1)
    notify(`Додано ${pluralCards(result.added)}`)
    return result.deckId
  }

  const title = activeDeck?.title ?? 'Усі картки'
  const progress = stats.total === 0 ? 0 : Math.round((stats.learned / stats.total) * 100)
  const barHeight = 128 + insets.bottom

  if (studyCards) {
    return (
      <>
        <StudySession
          cards={studyCards}
          title={title}
          labelFor={(card) => (card.deckId ? deckTitles.get(card.deckId) : undefined)}
          onAnswer={(id, learned) => void run(repository.setLearned(id, learned))}
          onClose={() => setStudyCards(null)}
        />
        <Toast notice={notice?.tone === 'error' ? notice : null} bottom={insets.bottom + 24} />
      </>
    )
  }

  const header = (
    <View style={styles.listHeader}>
      <DeckHeader
        key={`header-${activeDeck?.id ?? 'all'}`}
        title={title}
        count={cards.total}
        editable={activeDeck !== undefined}
        onRename={(next) => (activeDeck ? run(repository.renameDeck(activeDeck.id, next), DECK_MESSAGES.renamed) : null)}
        onDelete={() => {
          if (activeDeck) {
            run(repository.removeDeck(activeDeck.id), DECK_MESSAGES.deleted)
            setScope(ALL)
          }
        }}
      />
      {cards.total === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {query ? `За запитом «${query}» нічого не знайдено.` : 'У колоді ще немає карток. Додайте першу у формі вище або згенеруйте колоду з ШІ.'}
          </Text>
        </View>
      ) : null}
    </View>
  )

  return (
    <Pressable accessible={false} onPress={Keyboard.dismiss} style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      <View style={styles.topBar}>
        <Logo />
        <Button
          label="Згенерувати"
          variant="accent"
          size="sm"
          icon={<Sparkles color="#c4561d" size={14} />}
          onPress={() => setGenerating(true)}
        />
      </View>

      {decks.length === 0 ? (
        <Welcome onCreate={() => setAdding(true)} onGenerate={() => setGenerating(true)} />
      ) : (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.searchWrap}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Пошук карток"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Пошук карток"
              clearButtonMode="while-editing"
              returnKeyType="search"
              style={styles.search}
            />
          </View>
          <DeckBar decks={decks} allTotal={allStats.total} scope={effectiveScope} onScopeChange={setScope} onCreateDeck={createDeck} />
          <FlatList
            data={cards.items}
            keyExtractor={(card) => String(card.id)}
            numColumns={2}
            contentContainerStyle={[styles.list, { paddingBottom: barHeight + 24 }]}
            ListHeaderComponent={header}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onEndReached={cards.loadMore}
            onEndReachedThreshold={0.6}
            initialNumToRender={8}
            windowSize={7}
            removeClippedSubviews
            renderItem={({ item }) => (
              <CardTile
                card={item}
                label={activeDeck || !item.deckId ? undefined : deckTitles.get(item.deckId)}
                onToggle={toggleCard}
                onRemove={removeCard}
                onEdit={setEditing}
              />
            )}
          />
          {query ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Нова картка"
              onPress={() => setAdding(true)}
              style={({ pressed }) => [styles.fab, { bottom: barHeight + 16 }, pressed && styles.fabPressed]}
            >
              <PlusIcon size={18} thickness={2.5} color={colors.primaryForeground} />
            </Pressable>
          )}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                Вивчено <Text style={styles.progressStrong}>{stats.learned.toLocaleString('uk-UA')}</Text> з {stats.total.toLocaleString('uk-UA')}
              </Text>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress}%` }]} />
            </View>
            <Button
              label="Почати повторення"
              variant="dark"
              disabled={stats.total === 0}
              onPress={() => setStudyCards(repository.studyCards(effectiveScope, STUDY_BATCH))}
            />
          </View>
        </KeyboardAvoidingView>
      )}

      {adding ? (
        <AddCardDialog
          deckTitle={activeDeck?.title}
          deckOptions={activeDeck ? undefined : deckOptions}
          onAdd={addCard}
          onClose={() => setAdding(false)}
        />
      ) : null}
      {editing ? (
        <CardEditor
          card={editing}
          deckOptions={deckOptions}
          onSave={(draft, deckId) => run(repository.updateCard(editing.id, draft, deckId), CARD_MESSAGES.updated)}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {generating ? (
        <GenerateSheet
          decks={decks}
          defaultDeckId={activeDeck?.id ?? null}
          onSave={saveGenerated}
          onSaved={(deckId) => setScope({ kind: 'deck', id: deckId })}
          onClose={() => setGenerating(false)}
        />
      ) : null}
      <Toast notice={notice} bottom={decks.length === 0 ? insets.bottom + 24 : barHeight + 12} />
    </Pressable>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const hideNativeSplash = useCallback(() => SplashScreen.hide(), [])
  const finishSplash = useCallback(() => setSplashDone(true), [])
  const [fontsLoaded, fontsError] = useFonts({
    Literata_500Medium,
    Literata_600SemiBold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  })

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {fontsLoaded || fontsError ? (
        <View style={styles.flex}>
          <Home />
          {splashDone ? null : <Splash onReady={hideNativeSplash} onFinish={finishSplash} />}
        </View>
      ) : null}
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  search: {
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.foreground,
  },
  list: {
    paddingHorizontal: 13,
    paddingTop: 18,
    gap: 18,
  },
  listHeader: {
    gap: 16,
    marginBottom: 2,
    marginHorizontal: 7,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...lift,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
  },
  empty: {
    paddingVertical: 28,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 10,
    ...lift,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.muted,
  },
  progressStrong: {
    color: colors.foreground,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.success,
  },
})
