import type { FormEvent } from 'react'
import {
  cardCountOptions,
  deckTypes,
  getGenerationErrorMessage,
  languageOptions,
  TOPIC_LIMITS,
} from '@/features/generate-deck'
import { Button } from '@/shared/ui/button'
import { Chips } from '@/shared/ui/chips'
import { SparklesIcon } from '@/shared/ui/icon'
import { useSessionStore } from '../model/session.store'

const labelClass = 'text-xs font-semibold uppercase tracking-[0.04em] text-muted'

const inputClass =
  'w-full rounded-card border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50'

export const GenerateForm = () => {
  const mode = useSessionStore((state) => state.mode)
  const topic = useSessionStore((state) => state.topic)
  const language = useSessionStore((state) => state.language)
  const count = useSessionStore((state) => state.count)
  const errorCode = useSessionStore((state) => state.errorCode)
  const status = useSessionStore((state) => state.status)
  const setMode = useSessionStore((state) => state.setMode)
  const setTopic = useSessionStore((state) => state.setTopic)
  const setLanguage = useSessionStore((state) => state.setLanguage)
  const setCount = useSessionStore((state) => state.setCount)
  const generate = useSessionStore((state) => state.generate)

  const generating = status === 'generating'
  const topicReady = topic.trim().length >= TOPIC_LIMITS.minLength
  const selectedType = deckTypes.find((type) => type.id === mode)?.label
  const selectedLanguage = languageOptions.find((option) => option.id === language)?.label

  const onSelectType = (label: string) => {
    const type = deckTypes.find((item) => item.label === label)
    if (type) {
      setMode(type.id)
    }
  }

  const onSelectLanguage = (label: string) => {
    const option = languageOptions.find((item) => item.label === label)
    if (option) {
      setLanguage(option.id)
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (topicReady) {
      void generate()
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <label htmlFor="deck-topic" className={labelClass}>
        Тема
      </label>
      <input
        id="deck-topic"
        type="text"
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        maxLength={TOPIC_LIMITS.maxLength}
        placeholder="Наприклад: столиці Європи"
        disabled={generating}
        className={inputClass}
      />

      <p className={labelClass}>Тип колоди</p>
      <Chips
        items={deckTypes.map((type) => type.label)}
        value={selectedType}
        onSelect={onSelectType}
        disabled={generating}
      />

      <p className={labelClass}>Мова карток</p>
      <Chips
        items={languageOptions.map((option) => option.label)}
        value={selectedLanguage}
        onSelect={onSelectLanguage}
        disabled={generating}
      />

      <p className={labelClass}>Кількість карток</p>
      <Chips
        items={cardCountOptions.map(String)}
        value={String(count)}
        onSelect={(value) => setCount(Number(value))}
        disabled={generating}
      />

      {errorCode ? (
        <p role="alert" className="text-[13px] font-semibold text-danger">
          {getGenerationErrorMessage(errorCode)}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full sm:w-fit" disabled={generating || !topicReady}>
        <SparklesIcon className="size-5" />
        {generating ? 'Генерую…' : 'Згенерувати колоду'}
      </Button>
    </form>
  )
}
