import { type SubmitEvent, useState } from 'react'
import { Button } from '@/shared/ui/button'
import { isTopic, TOPICS } from '@deckly/shared/study-cards'
import type { NewStudyCard, Topic } from '../model/study-card'

type CardFormProps = {
  onAdd: (card: NewStudyCard) => boolean
}

const fieldClass =
  'w-full rounded-card border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const CardForm = ({ onAdd }: CardFormProps) => {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [topic, setTopic] = useState<Topic>(TOPICS[0])
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (onAdd({ question, answer, topic, dueDate })) {
      setQuestion('')
      setAnswer('')
      setDueDate('')
    }
  }

  return (
    <form className="mb-4 flex flex-col gap-3" onSubmit={handleSubmit}>
      <div className="flex gap-3 max-sm:flex-col">
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Питання"
          aria-label="Питання"
          className={fieldClass}
        />
        <input
          type="text"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Відповідь"
          aria-label="Відповідь"
          className={fieldClass}
        />
      </div>
      <div className="flex gap-3 max-sm:flex-col">
        <select
          value={topic}
          onChange={(event) => {
            if (isTopic(event.target.value)) {
              setTopic(event.target.value)
            }
          }}
          aria-label="Тема"
          className={fieldClass}
        >
          {TOPICS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          aria-label="Дата повторення"
          className={fieldClass}
        />
        <Button type="submit" className="shrink-0 max-sm:w-full">
          Додати
        </Button>
      </div>
    </form>
  )
}
