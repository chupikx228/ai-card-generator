import { Backdrop } from '@/shared/ui/backdrop'
import { useSessionStore } from '../model/session.store'
import { GenerateForm } from './GenerateForm'
import { ReviewStage } from './ReviewStage'
import { ResultStage } from './ResultStage'

export const ReviewDemo = () => {
  const status = useSessionStore((state) => state.status)

  return (
    <section id="demo" className="px-gutter py-section">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">Жива демонстрація</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          Обери тип колоди й повтори її просто зараз
        </h2>
      </div>

      <Backdrop className="mx-auto mt-8 max-w-xl rounded-sheet">
        <div className="rounded-sheet border border-border bg-surface-raised p-6 shadow-card sm:p-8">
          {status === 'idle' || status === 'generating' ? <GenerateForm /> : null}
          {status === 'reviewing' ? <ReviewStage /> : null}
          {status === 'done' ? <ResultStage /> : null}
        </div>
      </Backdrop>
    </section>
  )
}
