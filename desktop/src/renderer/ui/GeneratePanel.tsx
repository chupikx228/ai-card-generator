import { type SubmitEvent, useEffect, useRef, useState } from 'react'
import {
  CARD_COUNT_OPTIONS,
  DEFAULT_CARD_COUNT,
  type DeckLanguage,
  deckToStudyCards,
  getGenerationErrorMessage,
  TOPIC_LIMITS,
} from '@shared/decks'
import type { DeckRecord } from '@shared/study-cards'
import type { CardDraft } from '../../ipc/contract'
import { cn, pluralCards } from '../lib/text'
import { PreviewDraft, type PreviewDraftItem } from './PreviewDraft'
import { fieldClass, Select } from './Select'

type GeneratePanelProps = {
  decks: DeckRecord[]
  defaultDeckId: string | null
  onSave: (drafts: CardDraft[], deckId: string | null, newDeckTitle: string) => Promise<string | null>
  onSaved: (deckId: string) => void
  onClose: () => void
}

const NEW_DECK = 'new'

type Stage =
  | { name: 'form'; error: string | null }
  | { name: 'loading' }
  | { name: 'preview'; title: string; drafts: PreviewDraftItem[] }

const SLOW_HINT_MS = 6000
const REGENERATE_COUNT = CARD_COUNT_OPTIONS[0]
const REGENERATE_EMPTY = 'ШІ повернув лише схожі картки. Спробуйте ще раз.'

const SIMILARITY_LIMIT = 0.6

const toWords = (text: string): Set<string> => new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])

const isSimilar = (left: Set<string>, right: Set<string>): boolean => {
  const common = [...left].filter((word) => right.has(word)).length
  const union = left.size + right.size - common
  return union === 0 || common / union >= SIMILARITY_LIMIT
}

const LANGUAGES: Array<{ id: DeckLanguage; label: string }> = [
  { id: 'uk', label: 'Українська' },
  { id: 'en', label: 'English' },
]

const chipClass = (active: boolean) =>
  cn(
    'h-10 cursor-pointer rounded-xl border px-4 text-[14px] font-semibold transition-colors',
    active ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-background text-muted hover:text-foreground',
  )

const Sparkles = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" aria-hidden className={cn('fill-current', className)}>
    <path d="M8 2.5l1.4 3.9 3.9 1.4-3.9 1.4L8 13.1 6.6 9.2 2.7 7.8l3.9-1.4L8 2.5zm7 8l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
  </svg>
)

export const GenerateButton = ({ onClick, variant = 'solid' }: { onClick: () => void; variant?: 'solid' | 'link' }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex cursor-pointer items-center gap-2 font-bold transition',
      variant === 'solid'
        ? 'h-10 rounded-xl bg-accent/12 px-4 text-[14px] text-[color-mix(in_oklab,var(--accent)_75%,black)] hover:bg-accent/20 dark:text-accent'
        : 'text-[14px] text-primary hover:underline',
    )}
  >
    <Sparkles className="size-4" />
    Згенерувати з ШІ
  </button>
)

export const GeneratePanel = ({ decks, defaultDeckId, onSave, onSaved, onClose }: GeneratePanelProps) => {
  const [subject, setSubject] = useState('')
  const [count, setCount] = useState<number>(DEFAULT_CARD_COUNT)
  const [language, setLanguage] = useState<DeckLanguage>('uk')
  const [target, setTarget] = useState(defaultDeckId ?? NEW_DECK)
  const [stage, setStage] = useState<Stage>({ name: 'form', error: null })
  const [slow, setSlow] = useState(false)
  const [editingKey, setEditingKey] = useState<number | null>(null)
  const requestId = useRef(0)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      requestId.current += 1
    }
  }, [onClose])

  useEffect(() => {
    if (stage.name !== 'loading') {
      setSlow(false)
      return
    }
    const timer = window.setTimeout(() => setSlow(true), SLOW_HINT_MS)
    return () => window.clearTimeout(timer)
  }, [stage.name])

  const generate = async () => {
    if (subject.trim().length < TOPIC_LIMITS.minLength) {
      setStage({ name: 'form', error: `Опишіть тему хоча б ${TOPIC_LIMITS.minLength} символами.` })
      return
    }
    const current = ++requestId.current
    setEditingKey(null)
    setStage({ name: 'loading' })
    const result = await window.cardsAPI.generateDeck({ topic: subject, mode: 'qa', language, count })
    if (current !== requestId.current) {
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
    setStage({ name: 'preview', title: result.deck.title, drafts })
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void generate()
  }

  const updateDraft = (key: number, change: (draft: PreviewDraftItem) => PreviewDraftItem) =>
    setStage((current) =>
      current.name === 'preview'
        ? { ...current, drafts: current.drafts.map((draft) => (draft.key === key ? change(draft) : draft)) }
        : current,
    )

  const toggleDraft = (key: number) => updateDraft(key, (draft) => ({ ...draft, selected: !draft.selected }))

  const saveDraft = (key: number, next: CardDraft) => {
    updateDraft(key, (draft) => ({ ...draft, ...next, selected: true, error: null }))
    setEditingKey(null)
  }

  const regenerateDraft = async (key: number) => {
    if (stage.name !== 'preview') {
      return
    }
    const taken = stage.drafts.map((draft) => toWords(draft.question))
    const session = requestId.current
    updateDraft(key, (draft) => ({ ...draft, busy: true, error: null }))
    const result = await window.cardsAPI.generateDeck({ topic: subject, mode: 'qa', language, count: REGENERATE_COUNT })
    if (session !== requestId.current) {
      return
    }
    if (!result.ok) {
      updateDraft(key, (draft) => ({ ...draft, busy: false, error: getGenerationErrorMessage(result.code) }))
      return
    }
    const fresh = deckToStudyCards(result.deck, 'Інше').find((card) => {
      const words = toWords(card.question)
      return !taken.some((existing) => isSimilar(existing, words))
    })
    updateDraft(key, (draft) =>
      fresh
        ? { ...draft, question: fresh.question, answer: fresh.answer, selected: true, busy: false, error: null }
        : { ...draft, busy: false, error: REGENERATE_EMPTY },
    )
  }

  const save = async () => {
    if (stage.name !== 'preview') {
      return
    }
    const chosen = stage.drafts
      .filter((draft) => draft.selected)
      .map((draft) => ({ question: draft.question, answer: draft.answer }))
    const deckId = await onSave(chosen, target === NEW_DECK ? null : target, stage.title)
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
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-foreground/25 p-6 backdrop-blur-[2px]">
      <button type="button" aria-label="Закрити" onClick={onClose} className="absolute inset-0 cursor-default" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-title"
        className="relative flex max-h-full w-full max-w-[600px] flex-col overflow-hidden rounded-[28px] border border-border bg-surface shadow-lift"
      >
        <header className="flex items-start justify-between gap-4 px-8 pt-7 pb-5">
          <div>
            <h2 id="generate-title" className="flex items-center gap-2.5 font-serif text-[26px] font-semibold">
              <Sparkles className="size-5 text-accent" />
              Згенерувати картки
            </h2>
            <p className="mt-1 text-[14px] text-muted">
              Опишіть тему, і ШІ збере колоду з питань і відповідей. Перед збереженням її можна переглянути.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl text-muted hover:bg-background hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" className="size-4 fill-none stroke-current" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {stage.name === 'preview' ? (
          <>
            <div className="flex items-baseline justify-between gap-4 border-t border-border px-8 pt-5 pb-3">
              <p className="font-serif text-[18px] font-semibold">{stage.title}</p>
              <p className="shrink-0 text-[13px] font-semibold text-muted">
                Обрано {selectedCount} з {stage.drafts.length}
              </p>
            </div>
            <ul className="flex flex-col gap-2 overflow-y-auto px-8 pb-4">
              {stage.drafts.map((draft) => (
                <PreviewDraft
                  key={draft.key}
                  draft={draft}
                  editing={editingKey === draft.key}
                  onToggle={toggleDraft}
                  onStartEdit={setEditingKey}
                  onCancelEdit={() => setEditingKey(null)}
                  onSave={saveDraft}
                  onRegenerate={(key) => void regenerateDraft(key)}
                />
              ))}
            </ul>
            <footer className="flex items-center gap-3 border-t border-border px-8 py-5">
              <Select value={target} options={targetOptions} onChange={setTarget} label="Куди додати" className="min-w-0 flex-1" />
              <button
                type="button"
                onClick={() => void generate()}
                className="h-12 shrink-0 cursor-pointer rounded-2xl px-3 text-[14px] font-bold whitespace-nowrap text-muted hover:bg-background hover:text-foreground"
              >
                Згенерувати інші
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={selectedCount === 0 || pending}
                className="h-12 shrink-0 cursor-pointer rounded-2xl bg-primary px-5 text-[15px] font-bold whitespace-nowrap text-primary-foreground hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Додати {pluralCards(selectedCount)}
              </button>
            </footer>
          </>
        ) : stage.name === 'loading' ? (
          <div className="flex flex-col items-center gap-5 border-t border-border px-8 py-12 text-center" role="status">
            <div className="relative h-24 w-36" aria-hidden>
              <span className="absolute inset-0 animate-[pulse_1.6s_ease-in-out_infinite] rounded-2xl bg-accent/30 [transform:rotate(8deg)_translateX(14px)] motion-reduce:animate-none" />
              <span className="absolute inset-0 animate-[pulse_1.6s_ease-in-out_0.3s_infinite] rounded-2xl bg-primary/80 motion-reduce:animate-none" />
            </div>
            <p className="font-serif text-[20px] font-semibold">Готую картки про «{subject.trim()}»</p>
            <p className={cn('max-w-[380px] text-[14px] text-muted transition-opacity', slow ? 'opacity-100' : 'opacity-0')}>
              Сервер прокидається після простою, тому перший запит може тривати до хвилини.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 border-t border-border px-8 pt-6 pb-7">
            <label className="flex flex-col gap-2">
              <span className="text-[14px] font-bold">Про що картки?</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={TOPIC_LIMITS.maxLength}
                placeholder="Наприклад: неправильні дієслова англійської"
                autoFocus
                className={fieldClass}
              />
            </label>
            <div className="flex flex-wrap gap-x-8 gap-y-5">
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-[14px] font-bold">Кількість</legend>
                <div className="flex gap-2">
                  {CARD_COUNT_OPTIONS.map((option) => (
                    <button key={option} type="button" onClick={() => setCount(option)} aria-pressed={count === option} className={chipClass(count === option)}>
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-[14px] font-bold">Мова карток</legend>
                <div className="flex gap-2">
                  {LANGUAGES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLanguage(option.id)}
                      aria-pressed={language === option.id}
                      className={chipClass(language === option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-[14px] font-bold">Куди додати</span>
              <Select value={target} options={targetOptions} onChange={setTarget} label="Куди додати" />
            </label>
            {stage.error ? (
              <p role="alert" className="text-[14px] font-semibold text-danger">
                {stage.error}
              </p>
            ) : null}
            <button
              type="submit"
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground hover:brightness-110"
            >
              <Sparkles className="size-4" />
              Згенерувати картки
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
