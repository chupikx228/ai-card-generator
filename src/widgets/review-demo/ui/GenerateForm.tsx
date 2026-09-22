import { deckTypes } from '@/features/generate-deck'
import { Button } from '@/shared/ui/button'
import { Chips } from '@/shared/ui/chips'
import { SparklesIcon } from '@/shared/ui/icon'
import { useSessionStore } from '../model/session.store'

export const GenerateForm = () => {
  const mode = useSessionStore((state) => state.mode)
  const status = useSessionStore((state) => state.status)
  const setMode = useSessionStore((state) => state.setMode)
  const generate = useSessionStore((state) => state.generate)

  const generating = status === 'generating'
  const selectedLabel = deckTypes.find((type) => type.id === mode)?.label

  const onSelect = (label: string) => {
    const type = deckTypes.find((item) => item.label === label)
    if (type) {
      setMode(type.id)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">Тип колоди</p>
      <Chips
        items={deckTypes.map((type) => type.label)}
        value={selectedLabel}
        onSelect={onSelect}
        disabled={generating}
      />
      <Button
        size="lg"
        className="w-full sm:w-fit"
        disabled={generating}
        onClick={() => void generate()}
      >
        <SparklesIcon className="size-5" />
        {generating ? 'Генерую…' : 'Згенерувати колоду'}
      </Button>
    </div>
  )
}
