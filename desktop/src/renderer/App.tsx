import { useCallback, useMemo, useState } from 'react'
import { CARD_MESSAGES, DECK_MESSAGES, DEFAULT_DECK_TITLE, type StudyCard } from '@deckly/shared/study-cards'
import type { CardDraft, Scope } from '../ipc/contract'
import { pluralCards } from './lib/text'
import type { Notice } from './model/notice'
import { useCardPages, useDebouncedValue, useDecks, useStats } from './model/use-data'
import { CardEditor } from './ui/CardEditor'
import { CardPlaceholder, CardTile } from './ui/CardTile'
import { Composer } from './ui/Composer'
import { DeckHeader } from './ui/DeckHeader'
import { GenerateButton, GeneratePanel } from './ui/GeneratePanel'
import { Sidebar } from './ui/Sidebar'
import { StudySession } from './ui/StudySession'
import { Toast } from './ui/Toast'
import { VirtualGrid } from './ui/VirtualGrid'
import { Welcome } from './ui/Welcome'

const ALL: Scope = { kind: 'all' }
const STUDY_BATCH = 200

type Outcome = { ok: true } | { ok: false; error: string }

export const App = () => {
  const [version, setVersion] = useState(0)
  const [scope, setScope] = useState<Scope>(ALL)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [studyCards, setStudyCards] = useState<StudyCard[] | null>(null)
  const [generating, setGenerating] = useState(false)
  const [editing, setEditing] = useState<StudyCard | null>(null)

  const decks = useDecks(version)
  const activeDeck = scope.kind === 'deck' ? decks?.find((deck) => deck.id === scope.id) : undefined
  const effectiveScope: Scope = activeDeck ? scope : ALL
  const query = useDebouncedValue(search.trim())
  const stats = useStats(effectiveScope, version)
  const allStats = useStats(ALL, version)
  const pages = useCardPages(effectiveScope, query, version)

  const deckTitles = useMemo(() => new Map((decks ?? []).map((deck) => [deck.id, deck.title])), [decks])
  const deckOptions = useMemo(() => (decks ?? []).map((deck) => ({ value: deck.id, label: deck.title })), [decks])

  const notify = useCallback((text: string, tone: Notice['tone'] = 'success') => {
    setNotice({ id: Date.now(), text, tone })
  }, [])

  const run = useCallback(
    async (operation: Promise<Outcome>, message?: string): Promise<string | null> => {
      const result = await operation
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

  const toggleCard = useCallback(
    (card: StudyCard) => void run(window.cardsAPI.setLearned(card.id, !card.learned)),
    [run],
  )
  const removeCard = useCallback(
    (card: StudyCard) => void run(window.cardsAPI.removeCard(card.id), CARD_MESSAGES.deleted),
    [run],
  )

  const addCard = async (draft: CardDraft, deckId: string | null): Promise<string | null> => {
    const result = await window.cardsAPI.addCards(activeDeck?.id ?? deckId, DEFAULT_DECK_TITLE, [draft])
    if (!result.ok) {
      return result.error
    }
    setVersion((value) => value + 1)
    notify(CARD_MESSAGES.added)
    return null
  }

  const saveGenerated = async (drafts: CardDraft[], deckId: string | null, title: string): Promise<string | null> => {
    const result = await window.cardsAPI.addCards(deckId, title, drafts)
    if (!result.ok) {
      notify(result.error, 'error')
      return null
    }
    setVersion((value) => value + 1)
    notify(`Додано ${pluralCards(result.added)}`)
    return result.deckId
  }

  const createDeck = async (title: string): Promise<string | null> => {
    const result = await window.cardsAPI.createDeck(title)
    if (!result.ok) {
      return result.error
    }
    setVersion((value) => value + 1)
    notify(DECK_MESSAGES.created)
    setScope({ kind: 'deck', id: result.deck.id })
    return null
  }

  const startStudy = async () => {
    setStudyCards(await window.cardsAPI.studyCards(effectiveScope, STUDY_BATCH))
  }

  if (decks === null) {
    return <div className="drag-region h-full" />
  }

  const title = activeDeck?.title ?? 'Усі картки'
  const total = pages.total ?? (query ? 0 : stats.total)

  if (studyCards) {
    return (
      <>
        <StudySession
          cards={studyCards}
          title={title}
          labelFor={(card) => (card.deckId ? deckTitles.get(card.deckId) : undefined)}
          onAnswer={(id, learned) => void run(window.cardsAPI.setLearned(id, learned))}
          onClose={() => setStudyCards(null)}
        />
        <Toast notice={notice?.tone === 'error' ? notice : null} />
      </>
    )
  }

  return (
    <div className="flex h-full">
      <Sidebar
        decks={decks}
        allTotal={allStats.total}
        scope={effectiveScope}
        onScopeChange={setScope}
        onCreateDeck={createDeck}
        search={search}
        onSearchChange={setSearch}
        learned={stats.learned}
        total={stats.total}
        onStudy={() => void startStudy()}
      />
      <main className="my-2.5 mr-2.5 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-border bg-surface shadow-card">
        {decks.length === 0 ? (
          <Welcome onAdd={addCard} onGenerate={() => setGenerating(true)} />
        ) : (
          <>
            <header className="flex flex-col gap-5 border-b border-border px-8 pt-8 pb-3">
              <DeckHeader
                key={`header-${activeDeck?.id ?? 'all'}`}
                title={title}
                count={total}
                editable={activeDeck !== undefined}
                onRename={(next) =>
                  activeDeck ? run(window.cardsAPI.renameDeck(activeDeck.id, next), DECK_MESSAGES.renamed) : Promise.resolve(null)
                }
                onDelete={() => {
                  if (activeDeck) {
                    void run(window.cardsAPI.removeDeck(activeDeck.id), DECK_MESSAGES.deleted)
                    setScope(ALL)
                  }
                }}
                action={<GenerateButton onClick={() => setGenerating(true)} />}
              />
              <Composer
                key={`composer-${activeDeck?.id ?? 'all'}`}
                onAdd={addCard}
                deckOptions={activeDeck ? undefined : deckOptions}
              />
            </header>
            {pages.total === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-3 px-8 text-center">
                <p className="text-[15px] text-muted">
                  {query
                    ? `За запитом «${query}» нічого не знайдено.`
                    : 'У колоді ще немає карток. Додайте першу у формі вище або згенеруйте колоду з ШІ.'}
                </p>
                {query ? null : <GenerateButton onClick={() => setGenerating(true)} />}
              </div>
            ) : (
              <VirtualGrid
                total={total}
                resetKey={`${activeDeck?.id ?? 'all'}|${query}`}
                getItem={pages.getItem}
                requestRange={pages.requestRange}
                renderPlaceholder={() => <CardPlaceholder />}
                renderItem={(card) => (
                  <CardTile
                    key={card.id}
                    card={card}
                    label={activeDeck || !card.deckId ? undefined : deckTitles.get(card.deckId)}
                    onToggle={toggleCard}
                    onRemove={removeCard}
                    onEdit={setEditing}
                  />
                )}
              />
            )}
          </>
        )}
      </main>
      {editing ? (
        <CardEditor
          card={editing}
          deckOptions={deckOptions}
          onSave={(draft, deckId) => run(window.cardsAPI.updateCard(editing.id, draft, deckId), CARD_MESSAGES.updated)}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {generating ? (
        <GeneratePanel
          decks={decks}
          defaultDeckId={activeDeck?.id ?? null}
          onSave={saveGenerated}
          onSaved={(deckId) => setScope({ kind: 'deck', id: deckId })}
          onClose={() => setGenerating(false)}
        />
      ) : null}
      <Toast notice={notice} />
    </div>
  )
}
