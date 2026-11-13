import { type ReactNode, type SubmitEvent, useState } from 'react'
import { pluralCards } from '../lib/text'

type DeckHeaderProps = {
  title: string
  count: number
  editable: boolean
  onRename: (title: string) => Promise<string | null>
  onDelete: () => void
  action: ReactNode
}

const ghostButton =
  'h-10 cursor-pointer rounded-xl px-3.5 text-[14px] font-semibold text-muted transition-colors hover:bg-background hover:text-foreground'

export const DeckHeader = ({ title, count, editable, onRename, onDelete, action }: DeckHeaderProps) => {
  const [mode, setMode] = useState<'view' | 'rename' | 'confirm-delete'>('view')
  const [draft, setDraft] = useState(title)
  const [error, setError] = useState<string | null>(null)

  const handleRename = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await onRename(draft)
    setError(result)
    if (!result) {
      setMode('view')
    }
  }

  if (mode === 'rename') {
    return (
      <form onSubmit={(event) => void handleRename(event)} className="flex items-center gap-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setMode('view')
              setDraft(title)
              setError(null)
            }
          }}
          aria-label="Назва колоди"
          autoFocus
          className="h-12 min-w-0 flex-1 rounded-2xl border border-primary bg-surface px-4 font-serif text-[26px] font-semibold focus:outline-none"
        />
        {error ? <p className="text-[13px] font-semibold text-danger">{error}</p> : null}
        <button type="submit" className="h-10 cursor-pointer rounded-xl bg-primary px-4 text-[14px] font-bold text-primary-foreground">
          Зберегти
        </button>
      </form>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
      <h1 className="min-w-0 font-serif text-[32px] leading-tight font-semibold tracking-[-0.015em] break-words">
        {title}
      </h1>
      <span className="mt-2 shrink-0 text-[14px] font-semibold text-muted">{pluralCards(count)}</span>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {editable && mode === 'confirm-delete' ? (
          <>
            <span className="text-[14px] font-semibold text-danger">Видалити колоду разом з картками?</span>
            <button type="button" onClick={onDelete} className="h-10 cursor-pointer rounded-xl bg-danger px-4 text-[14px] font-bold text-white">
              Видалити
            </button>
            <button type="button" onClick={() => setMode('view')} className={ghostButton}>
              Скасувати
            </button>
          </>
        ) : (
          <>
            {editable ? (
              <>
                <button type="button" onClick={() => setMode('rename')} className={ghostButton}>
                  Перейменувати
                </button>
                <button type="button" onClick={() => setMode('confirm-delete')} className={`${ghostButton} hover:text-danger`}>
                  Видалити колоду
                </button>
              </>
            ) : null}
            {action}
          </>
        )}
      </div>
    </div>
  )
}
