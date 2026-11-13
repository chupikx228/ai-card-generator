import { type SubmitEvent, useState } from 'react'
import type { DeckSummary, Scope } from '../../ipc/contract'
import { cn } from '../lib/text'

type SidebarProps = {
  decks: DeckSummary[]
  allTotal: number
  scope: Scope
  onScopeChange: (scope: Scope) => void
  onCreateDeck: (title: string) => Promise<string | null>
  search: string
  onSearchChange: (value: string) => void
  learned: number
  total: number
  onStudy: () => void
}

const itemClass =
  'no-drag flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-[14px] font-semibold transition-colors'

const DeckGlyph = ({ complete }: { complete: boolean }) => (
  <svg viewBox="0 0 18 18" aria-hidden className="size-[18px] shrink-0">
    <rect x="5" y="2.5" width="11" height="9" rx="2.2" className="fill-accent/45" />
    <rect x="2" y="6" width="12" height="9.5" rx="2.4" className={complete ? 'fill-success' : 'fill-primary'} />
  </svg>
)

export const Sidebar = ({
  decks,
  allTotal,
  scope,
  onScopeChange,
  onCreateDeck,
  search,
  onSearchChange,
  learned,
  total,
  onStudy,
}: SidebarProps) => {
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const progress = total === 0 ? 0 : Math.round((learned / total) * 100)

  const closeCreator = () => {
    setCreating(false)
    setTitle('')
    setError(null)
  }

  const handleCreate = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await onCreateDeck(title)
    if (result) {
      setError(result)
      return
    }
    closeCreator()
  }

  return (
    <aside className="drag-region flex w-64 shrink-0 flex-col px-4 pt-14 pb-5">
      <div className="flex items-center gap-3 px-2">
        <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
          <rect x="7" y="4" width="20" height="14" rx="3.5" className="fill-accent" transform="rotate(8 17 11)" />
          <rect x="4" y="11" width="22" height="16" rx="4" className="fill-primary" />
        </svg>
        <span className="font-serif text-[24px] font-semibold tracking-[-0.01em]">Deckly</span>
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Пошук карток"
        aria-label="Пошук карток"
        className="no-drag mt-7 h-10 rounded-xl border border-border bg-surface px-3.5 text-[14px] placeholder:text-muted focus:border-primary focus:outline-none"
      />

      <button
        type="button"
        onClick={() => onScopeChange({ kind: 'all' })}
        aria-current={scope.kind === 'all'}
        className={cn(
          itemClass,
          'mt-5',
          scope.kind === 'all' ? 'bg-surface shadow-card' : 'text-muted hover:text-foreground',
        )}
      >
        <span className="flex-1">Усі картки</span>
        <span className="tabular-nums text-muted">{allTotal.toLocaleString('uk-UA')}</span>
      </button>

      <div className="mt-6 flex items-center justify-between px-3">
        <h2 className="text-[13px] font-bold text-muted">Колоди</h2>
        <button
          type="button"
          onClick={() => setCreating(true)}
          aria-label="Нова колода"
          className="no-drag grid size-7 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface hover:text-foreground"
        >
          <svg viewBox="0 0 16 16" className="size-4 fill-none stroke-current" aria-hidden>
            <path d="M8 3v10M3 8h10" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav aria-label="Колоди" className="no-drag mt-1.5 -mx-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-1">
        {creating ? (
          <form onSubmit={(event) => void handleCreate(event)} className="mb-1 flex flex-col gap-1">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  closeCreator()
                }
              }}
              onBlur={() => (title.trim() ? undefined : closeCreator())}
              placeholder="Назва колоди"
              aria-label="Назва нової колоди"
              autoFocus
              className="h-10 rounded-xl border border-primary bg-surface px-3 text-[14px] font-semibold focus:outline-none"
            />
            {error ? <p className="px-1 text-[12px] font-semibold text-danger">{error}</p> : null}
          </form>
        ) : null}
        {decks.map((deck) => {
          const complete = deck.total > 0 && deck.learned === deck.total
          const active = scope.kind === 'deck' && scope.id === deck.id
          return (
            <button
              key={deck.id}
              type="button"
              onClick={() => onScopeChange({ kind: 'deck', id: deck.id })}
              aria-current={active}
              className={cn(itemClass, active ? 'bg-surface shadow-card' : 'text-muted hover:text-foreground')}
            >
              <DeckGlyph complete={complete} />
              <span className={cn('min-w-0 flex-1 truncate', active && 'text-foreground')}>{deck.title}</span>
              <span className="tabular-nums text-muted">{deck.total.toLocaleString('uk-UA')}</span>
            </button>
          )
        })}
        {decks.length === 0 && !creating ? (
          <p className="px-3 py-1 text-[13px] leading-relaxed text-muted">Колоди з’являться тут після першої картки.</p>
        ) : null}
      </nav>

      <div className="mt-4 flex flex-col gap-3 px-1">
        <div>
          <p className="text-[13px] font-semibold text-muted">
            Вивчено <span className="text-foreground">{learned.toLocaleString('uk-UA')}</span> з {total.toLocaleString('uk-UA')}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border" aria-hidden>
            <div
              className="h-full rounded-full bg-success transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onStudy}
          disabled={total === 0}
          className="no-drag h-11 cursor-pointer rounded-2xl bg-foreground text-[14px] font-bold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Почати повторення
        </button>
        <p className="text-[12px] leading-relaxed text-muted">Картки зберігаються у файлі на цьому комп’ютері.</p>
      </div>
    </aside>
  )
}
