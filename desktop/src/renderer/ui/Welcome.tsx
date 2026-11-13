import { useState } from 'react'
import type { CardDraft } from '../../ipc/contract'
import { AnswerFace, QuestionFace } from './CardFaces'
import { Composer } from './Composer'
import { FlashCard } from './FlashCard'
import { GenerateButton } from './GeneratePanel'

type WelcomeProps = {
  onAdd: (draft: CardDraft, deckId: string | null) => Promise<string | null>
  onGenerate: () => void
}

export const Welcome = ({ onAdd, onGenerate }: WelcomeProps) => {
  const [flipped, setFlipped] = useState(false)

  return (
    <section className="h-full overflow-y-auto">
      <div className="mx-auto grid min-h-full max-w-[1000px] grid-cols-1 items-center gap-12 px-12 py-12 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="font-serif text-[40px] leading-[1.1] font-semibold tracking-[-0.02em]">
              Картки, які допомагають запам’ятати
            </h1>
            <p className="mt-4 max-w-[440px] text-[16px] leading-relaxed text-muted">
              Запишіть питання з одного боку й відповідь з іншого. Перевертайте картки, щоб перевірити себе, і
              відмічайте те, що вже вивчили.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-[15px] font-bold">Створіть першу картку</h2>
            <Composer onAdd={onAdd} layout="stack" autoFocus />
            <p className="flex items-center gap-2 text-[14px] text-muted">
              Не хочеться писати вручну?
              <GenerateButton onClick={onGenerate} variant="link" />
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 max-lg:order-first">
          <FlashCard
            className="aspect-[3/2] w-full max-w-[420px] rotate-[-3deg]"
            flipped={flipped}
            onFlip={() => setFlipped((value) => !value)}
            label="Приклад картки. Натисніть, щоб перевернути"
            front={<QuestionFace label="Англійська мова" question="Що означає слово «deck»?" />}
            back={<AnswerFace answer="Колода карт. Саме так ви збиратимете свої картки." />}
          />
          <p className="text-[13px] font-medium text-muted">Натисніть на картку, щоб перевернути її</p>
        </div>
      </div>
    </section>
  )
}
