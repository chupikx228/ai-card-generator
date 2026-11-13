import { type KeyboardEvent, type SubmitEvent, useState } from 'react'
import type { StudyCard } from '@shared/study-cards'
import type { CardDraft } from '../../ipc/contract'
import { Select, type SelectOption } from './Select'

type CardEditorProps = {
  card: StudyCard
  deckOptions: SelectOption[]
  onSave: (draft: CardDraft, deckId: string) => Promise<string | null>
  onClose: () => void
}

export const areaClass =
  'field-sizing-content min-h-[2lh] max-h-60 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:border-primary focus:bg-surface focus:outline-none'

export const CardEditor = ({ card, deckOptions, onSave, onClose }: CardEditorProps) => {
  const [question, setQuestion] = useState(card.question)
  const [answer, setAnswer] = useState(card.answer)
  const [deckId, setDeckId] = useState(card.deckId ?? deckOptions[0]?.value ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const result = await onSave({ question, answer }, deckId)
    setSaving(false)
    setError(result)
    if (!result) {
      onClose()
    }
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void save()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Escape') {
      onClose()
    } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      void save()
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-foreground/25 p-6 backdrop-blur-[2px]">
      <button type="button" aria-label="Закрити" onClick={onClose} className="absolute inset-0 cursor-default" />
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label="Редагування картки"
        className="relative flex w-full max-w-[520px] flex-col gap-4 rounded-[28px] border border-border bg-surface p-7 shadow-lift"
      >
        <h2 className="font-serif text-[24px] font-semibold">Редагувати картку</h2>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold text-muted">Питання</span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={1}
            autoFocus
            className={`${areaClass} font-serif text-[19px] leading-snug`}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-bold text-muted">Відповідь</span>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={1}
            className={`${areaClass} text-[16px]`}
          />
        </label>
        {deckOptions.length > 1 ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-bold text-muted">Колода</span>
            <Select value={deckId} options={deckOptions} onChange={setDeckId} label="Колода" />
          </label>
        ) : null}
        {error ? (
          <p role="alert" className="text-[14px] font-semibold text-danger">
            {error}
          </p>
        ) : null}
        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto text-[12px] text-muted">⌘ Enter, щоб зберегти</span>
          <button
            type="button"
            onClick={onClose}
            className="h-11 cursor-pointer rounded-2xl px-4 text-[14px] font-semibold text-muted hover:bg-background hover:text-foreground"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 cursor-pointer rounded-2xl bg-primary px-5 text-[14px] font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60"
          >
            Зберегти
          </button>
        </div>
      </form>
    </div>
  )
}
