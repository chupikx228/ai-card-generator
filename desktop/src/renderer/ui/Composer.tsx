import { type SubmitEvent, useRef, useState } from 'react'
import type { CardDraft } from '../../ipc/contract'
import { cn } from '../lib/text'
import { fieldClass, Select, type SelectOption } from './Select'

type ComposerProps = {
  onAdd: (draft: CardDraft, deckId: string | null) => Promise<string | null>
  deckOptions?: SelectOption[]
  layout?: 'row' | 'stack'
  autoFocus?: boolean
}

export const Composer = ({ onAdd, deckOptions, layout = 'row', autoFocus = false }: ComposerProps) => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [deckId, setDeckId] = useState(deckOptions?.[0]?.value ?? '')
  const [error, setError] = useState<string | null>(null)
  const questionRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = await onAdd({ question, answer }, deckOptions ? deckId : null)
    setError(result)
    if (!result) {
      setQuestion('')
      setAnswer('')
      questionRef.current?.focus()
    }
  }

  const stacked = layout === 'stack'

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate className={cn('flex flex-col gap-2.5', stacked && 'w-full max-w-[560px]')}>
      <div className={cn('flex gap-2.5', stacked ? 'flex-col' : 'flex-wrap')}>
        <input
          ref={questionRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Питання"
          aria-label="Питання"
          aria-invalid={error !== null && !question.trim()}
          autoFocus={autoFocus}
          className={cn(fieldClass, !stacked && 'min-w-52 flex-[1.4]')}
        />
        <input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Відповідь"
          aria-label="Відповідь"
          className={cn(fieldClass, !stacked && 'min-w-44 flex-1')}
        />
        <div className={cn('flex gap-2.5', stacked && 'justify-end')}>
          {deckOptions && deckOptions.length > 0 ? (
            <Select
              value={deckId}
              options={deckOptions}
              onChange={setDeckId}
              label="Колода"
              className={cn('w-48', stacked && 'flex-1')}
            />
          ) : null}
          <button
            type="submit"
            className="h-12 shrink-0 cursor-pointer rounded-2xl bg-primary px-6 text-[15px] font-bold whitespace-nowrap text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
          >
            Додати картку
          </button>
        </div>
      </div>
      <p role="alert" className={cn('min-h-5 px-1 text-[13px] font-semibold text-danger', !error && 'invisible')}>
        {error ?? ' '}
      </p>
    </form>
  )
}
