import { useEffect, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'
import { loadCards, type NewStudyCard, saveCards, type StudyCard } from '../model/study-card'
import { CardForm } from './CardForm'
import { CardList } from './CardList'
import { CardsHeader } from './CardsHeader'

type Message = {
  text: string
  type: 'error' | 'success'
}

export const CardsPage = () => {
  const [cards, setCards] = useState<StudyCard[]>(loadCards)
  const [message, setMessage] = useState<Message | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    saveCards(cards)
  }, [cards])

  const addCard = (input: NewStudyCard): boolean => {
    const question = input.question.trim()
    const answer = input.answer.trim()
    if (!question) {
      setMessage({ text: 'Введіть текст питання.', type: 'error' })
      return false
    }
    if (!answer) {
      setMessage({ text: 'Введіть відповідь.', type: 'error' })
      return false
    }
    setCards([...cards, { ...input, id: Date.now(), question, answer, learned: false }])
    setMessage({ text: 'Картку додано.', type: 'success' })
    return true
  }

  const toggleCard = (id: number) => {
    setCards(cards.map((card) => (card.id === id ? { ...card, learned: !card.learned } : card)))
  }

  const deleteCard = (id: number) => {
    setCards(cards.filter((card) => card.id !== id))
    setMessage({ text: 'Картку видалено.', type: 'success' })
  }

  const learnedCount = cards.filter((card) => card.learned).length
  const query = search.trim().toLowerCase()
  const visibleCards = query
    ? cards.filter((card) => `${card.question} ${card.answer} ${card.topic}`.toLowerCase().includes(query))
    : cards

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1 px-gutter py-section">
        <div className="mx-auto max-w-3xl rounded-sheet border border-border bg-surface-raised p-6 shadow-card sm:p-8">
          <CardsHeader total={cards.length} learned={learnedCount} />
          <CardForm onAdd={addCard} />
          {message ? (
            <p className={cn('mb-4 text-[14px] font-semibold', message.type === 'error' ? 'text-danger' : 'text-success')}>
              {message.text}
            </p>
          ) : null}
          {cards.length > 0 ? (
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Пошук за питанням, відповіддю або темою"
              aria-label="Пошук карток"
              className="mb-4 w-full rounded-card border border-border bg-background px-4 py-2.5 text-[15px] text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          ) : null}
          <CardList
            cards={visibleCards}
            emptyText={cards.length === 0 ? 'Карток поки немає. Додайте першу!' : 'Нічого не знайдено.'}
            onToggle={toggleCard}
            onDelete={deleteCard}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
