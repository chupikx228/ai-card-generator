import { cn } from '@/shared/lib/cn'

type Verdict = {
  correct: boolean
  answer: string
}

type StatementCardProps = {
  statement: string
  verdict: Verdict | null
}

export const StatementCard = ({ statement, verdict }: StatementCardProps) => (
  <article className="flex min-h-56 animate-card-in flex-col rounded-card border border-border bg-surface p-6 shadow-card">
    <p className="text-xs font-semibold uppercase tracking-[0.04em] text-muted">Твердження</p>
    <h3 className="mt-2 font-serif text-2xl font-semibold text-foreground">{statement}</h3>

    {verdict ? (
      <div className="mt-auto animate-reveal border-t border-border pt-4">
        <p className={cn('text-[15px] font-semibold', verdict.correct ? 'text-success' : 'text-danger')}>
          {verdict.correct ? 'Правильно' : 'Неправильно'}
        </p>
        <p className="mt-1 text-[15px] leading-6 text-muted">Насправді: {verdict.answer}</p>
      </div>
    ) : null}
  </article>
)
