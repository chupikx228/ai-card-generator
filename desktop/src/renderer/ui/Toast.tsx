import { useEffect, useState } from 'react'
import type { Notice } from '../model/notice'
import { cn } from '../lib/text'

const VISIBLE_MS = 2600

export const Toast = ({ notice }: { notice: Notice | null }) => {
  const [visibleId, setVisibleId] = useState<number | null>(null)

  useEffect(() => {
    if (!notice) {
      return
    }
    setVisibleId(notice.id)
    const timer = window.setTimeout(() => setVisibleId(null), VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [notice])

  const visible = notice !== null && visibleId === notice.id

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-5 py-3 text-[14px] font-semibold shadow-lift transition duration-200 motion-reduce:transition-none',
        notice?.tone === 'error' ? 'bg-danger text-white' : 'bg-foreground text-background',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
      )}
    >
      {notice?.tone === 'success' ? <span className="size-2 rounded-full bg-success" aria-hidden /> : null}
      {notice?.text}
    </div>
  )
}
