import { type KeyboardEvent, type ReactNode, type SubmitEvent, useState } from 'react'
import { validateCard } from '@deckly/shared/study-cards'
import type { CardDraft } from '../../ipc/contract'
import { cn } from '../lib/text'
import { areaClass } from './CardEditor'

export type PreviewDraftItem = CardDraft & {
  key: number
  selected: boolean
  busy: boolean
  error: string | null
}

type PreviewDraftProps = {
  draft: PreviewDraftItem
  editing: boolean
  onToggle: (key: number) => void
  onStartEdit: (key: number) => void
  onCancelEdit: () => void
  onSave: (key: number, draft: CardDraft) => void
  onRegenerate: (key: number) => void
}

const IconButton = ({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground disabled:cursor-wait"
  >
    {children}
  </button>
)

const DraftEditor = ({
  draft,
  onSave,
  onCancel,
}: {
  draft: PreviewDraftItem
  onSave: (draft: CardDraft) => void
  onCancel: () => void
}) => {
  const [question, setQuestion] = useState(draft.question)
  const [answer, setAnswer] = useState(draft.answer)
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    const result = validateCard({ question, answer, topic: 'Інше', dueDate: '' })
    setError(result)
    if (!result) {
      onSave({ question: question.trim(), answer: answer.trim() })
    }
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    save()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onCancel()
    } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      save()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      noValidate
      aria-label="Редагування картки"
      className="flex flex-col gap-2 rounded-2xl border border-primary/40 bg-primary-soft/40 p-3"
    >
      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={1}
        autoFocus
        aria-label="Питання"
        className={cn(areaClass, 'font-serif text-[16px] leading-snug')}
      />
      <textarea
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        rows={1}
        aria-label="Відповідь"
        className={cn(areaClass, 'text-[14px]')}
      />
      <div className="flex items-center gap-2">
        <p role="alert" className="mr-auto px-1 text-[13px] font-semibold text-danger">
          {error}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 cursor-pointer rounded-xl px-3 text-[14px] font-semibold text-muted hover:text-foreground"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="h-9 cursor-pointer rounded-xl bg-primary px-4 text-[14px] font-bold text-primary-foreground hover:brightness-110"
        >
          Зберегти
        </button>
      </div>
    </form>
  )
}

export const PreviewDraft = ({
  draft,
  editing,
  onToggle,
  onStartEdit,
  onCancelEdit,
  onSave,
  onRegenerate,
}: PreviewDraftProps) => {
  if (editing) {
    return (
      <li>
        <DraftEditor draft={draft} onSave={(next) => onSave(draft.key, next)} onCancel={onCancelEdit} />
      </li>
    )
  }

  return (
    <li className="group relative" aria-busy={draft.busy}>
      <label
        className={cn(
          'flex cursor-pointer gap-3.5 rounded-2xl border py-3 pr-22 pl-4 transition-colors',
          draft.selected ? 'border-primary/40 bg-primary-soft/60' : 'border-border opacity-60',
          draft.busy && 'pointer-events-none animate-pulse motion-reduce:animate-none',
        )}
      >
        <input
          type="checkbox"
          checked={draft.selected}
          onChange={() => onToggle(draft.key)}
          className="mt-1 size-4 shrink-0 cursor-pointer accent-[var(--primary)]"
        />
        <span className="min-w-0">
          <span className="block font-serif text-[16px] leading-snug font-medium break-words">{draft.question}</span>
          <span className="mt-1 block text-[14px] text-muted break-words">{draft.answer}</span>
        </span>
      </label>
      <div
        className={cn(
          'absolute top-2 right-2 flex gap-0.5 transition-opacity',
          draft.busy ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
        )}
      >
        <IconButton label="Редагувати" onClick={() => onStartEdit(draft.key)} disabled={draft.busy}>
          <svg viewBox="0 0 16 16" className="size-4 fill-none stroke-current" aria-hidden>
            <path d="M10.5 3 13 5.5 6 12.5H3.5V10L10.5 3Z" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </IconButton>
        <IconButton label="Згенерувати іншу картку" onClick={() => onRegenerate(draft.key)} disabled={draft.busy}>
          <svg
            viewBox="0 0 16 16"
            className={cn('size-4 fill-none stroke-current', draft.busy && 'animate-spin motion-reduce:animate-none')}
            aria-hidden
          >
            <path d="M13 8a5 5 0 1 1-1.5-3.55M13 2.5v3h-3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
      </div>
      {draft.error ? <p className="px-4 pt-1.5 text-[13px] font-semibold text-danger">{draft.error}</p> : null}
    </li>
  )
}
