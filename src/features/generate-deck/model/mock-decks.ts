import type { Card, TrueFalseCard } from '@/entities/card'
import type { Deck, ReviewMode } from '@/entities/deck'

export type DeckTypeOption = {
  id: ReviewMode
  label: string
}

export const deckTypes: DeckTypeOption[] = [
  { id: 'flip', label: 'Перегортання' },
  { id: 'qa', label: 'Питання-відповідь' },
  { id: 'truefalse', label: 'Правда / Брехня' },
]

const flipSeeds: Array<Pick<Card, 'front' | 'back'>> = [
  { front: 'deck', back: 'колода' },
  { front: 'review', back: 'повторення' },
  { front: 'card', back: 'картка' },
  { front: 'schedule', back: 'розклад; планувати' },
  { front: 'streak', back: 'серія днів поспіль' },
]

const qaSeeds: Array<Pick<Card, 'front' | 'back'>> = [
  { front: 'Що таке інтервальне повторення?', back: 'Метод навчання, за якого матеріал повторюють через дедалі більші проміжки часу.' },
  { front: 'Що таке FSRS?', back: 'Сучасний алгоритм планування повторень (Free Spaced Repetition Scheduler).' },
  { front: 'Навіщо потрібні флеш-картки?', back: 'Для активного пригадування, що зміцнює довготривалу памʼять.' },
  { front: 'Що таке активне пригадування?', back: 'Спроба згадати відповідь без підказки перед перевіркою.' },
  { front: 'Коли найкраще повторювати картку?', back: 'Незадовго до моменту, коли ти маєш її забути.' },
]

const trueFalseSeeds: Array<Pick<TrueFalseCard, 'statement' | 'isTrue'>> = [
  { statement: 'FSRS - це алгоритм планування повторень.', isTrue: true },
  { statement: 'Інтервальне повторення радить вивчати весь матеріал за одну ніч.', isTrue: false },
  { statement: 'Активне пригадування зміцнює памʼять краще, ніж перечитування.', isTrue: true },
  { statement: 'Флеш-картка має лицевий і зворотний бік.', isTrue: true },
  { statement: 'Найкраще повторювати картку одразу після її вивчення.', isTrue: false },
]

export const buildDeck = (mode: ReviewMode): Deck => {
  const title = deckTypes.find((item) => item.id === mode)?.label ?? 'Колода'
  const id = `${mode}-${Date.now()}`

  if (mode === 'truefalse') {
    return {
      id,
      mode,
      title,
      cards: trueFalseSeeds.map((seed, index) => ({ id: `${mode}-${index}`, ...seed })),
    }
  }

  const seeds = mode === 'flip' ? flipSeeds : qaSeeds

  return {
    id,
    mode,
    title,
    cards: seeds.map((seed, index) => ({ id: `${mode}-${index}`, ...seed })),
  }
}
