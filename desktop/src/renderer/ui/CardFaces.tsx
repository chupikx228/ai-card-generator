import { type MouseEvent, type RefObject, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../lib/text'

type FaceSize = 'md' | 'lg'
export type FaceOverflow = 'clamp' | 'scroll'

const LONG_TEXT = 140
const SCROLL_STEP = 0.8

const textClass = (text: string, size: FaceSize, overflow: FaceOverflow) => {
  const long = text.length > LONG_TEXT
  return cn(
    'font-serif font-medium leading-snug break-words',
    size === 'lg' ? (long ? 'text-[29px]' : 'text-[34px]') : long ? 'text-[17px]' : 'text-[19px]',
    overflow === 'clamp' && (size === 'lg' ? 'line-clamp-5' : 'line-clamp-4'),
  )
}

type FaceTextProps = {
  text: string
  size: FaceSize
  overflow: FaceOverflow
  scrollRef?: RefObject<HTMLSpanElement | null>
  className?: string
  arrowClass: string
}

const FaceText = ({ text, size, overflow, scrollRef, className, arrowClass }: FaceTextProps) => {
  const ownRef = useRef<HTMLSpanElement>(null)
  const ref = scrollRef ?? ownRef
  const [more, setMore] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current
    if (overflow !== 'scroll' || !element) {
      return
    }
    const update = () => setMore(element.scrollTop + element.clientHeight < element.scrollHeight - 2)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    if (element.firstElementChild) {
      observer.observe(element.firstElementChild)
    }
    element.addEventListener('scroll', update, { passive: true })
    return () => {
      observer.disconnect()
      element.removeEventListener('scroll', update)
    }
  }, [ref, overflow, text])

  if (overflow === 'clamp') {
    return <span className={cn('my-auto', textClass(text, size, overflow), className)}>{text}</span>
  }

  const scrollDown = (event: MouseEvent) => {
    event.stopPropagation()
    const element = ref.current
    element?.scrollBy({ top: element.clientHeight * SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <span className="relative -mx-2 my-3 flex min-h-0 flex-1 flex-col">
      <span
        ref={ref}
        className={cn(
          'flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2 [scrollbar-width:none]',
          more && '[mask-image:linear-gradient(to_bottom,black_72%,transparent)]',
        )}
      >
        <span className={cn('my-auto', textClass(text, size, overflow), className)}>{text}</span>
      </span>
      {more ? (
        <span
          aria-hidden
          onClick={scrollDown}
          className={cn(
            'absolute right-2 bottom-0 grid size-9 cursor-pointer place-items-center rounded-full transition hover:scale-105',
            arrowClass,
          )}
        >
          <svg viewBox="0 0 16 16" className="size-4 fill-none stroke-current">
            <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : null}
    </span>
  )
}

type QuestionFaceProps = {
  label?: string
  question: string
  learned?: boolean
  hint?: string
  size?: FaceSize
  overflow?: FaceOverflow
  scrollRef?: RefObject<HTMLSpanElement | null>
}

export const QuestionFace = ({
  label,
  question,
  learned = false,
  hint,
  size = 'md',
  overflow = 'clamp',
  scrollRef,
}: QuestionFaceProps) => (
  <span className={cn('flex h-full flex-col', size === 'lg' ? 'p-9' : 'p-5')}>
    <span className="flex items-center justify-between gap-3 text-[13px] font-semibold text-muted">
      <span className="min-w-0 truncate">{label}</span>
      {learned ? <span className="rounded-full bg-success/12 px-2.5 py-0.5 text-success">Вивчено</span> : null}
    </span>
    <FaceText
      text={question}
      size={size}
      overflow={overflow}
      scrollRef={scrollRef}
      className={cn('text-foreground', learned && 'text-foreground/55')}
      arrowClass="border border-border bg-surface text-foreground shadow-card"
    />
    {hint ? <span className="text-[13px] text-muted">{hint}</span> : null}
  </span>
)

type AnswerFaceProps = {
  answer: string
  size?: FaceSize
  overflow?: FaceOverflow
  scrollRef?: RefObject<HTMLSpanElement | null>
}

export const AnswerFace = ({ answer, size = 'md', overflow = 'clamp', scrollRef }: AnswerFaceProps) => (
  <span className={cn('flex h-full flex-col', size === 'lg' ? 'p-9' : 'p-5')}>
    <span className="text-[13px] font-semibold text-primary-foreground/70">Відповідь</span>
    <FaceText
      text={answer}
      size={size}
      overflow={overflow}
      scrollRef={scrollRef}
      arrowClass="bg-primary-foreground/15 text-primary-foreground"
    />
  </span>
)
