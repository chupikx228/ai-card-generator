import { useEffect, useState } from 'react'
import { CARD_MESSAGES, countLearned, createCard, filterCards, removeCard, toggleCard, validateCard } from '@deckly/shared/study-cards'
import { cn } from '@/shared/lib/cn'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'
import { cardStorage, type NewStudyCard, type StudyCard } from '../model/study-card'
import { CardForm } from './CardForm'
import { CardList } from './CardList'
import { CardsHeader } from './CardsHeader'

type Message = {
  text: string
  type: 'error' | 'success'
}

export const CardsPage = () => {
  const [cards, setCards] = useState<StudyCard[]>(cardStorage.load)
  const [message, setMessage] = useState<Message | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    cardStorage.save(cards)
  }, [cards])

  const addCard = (input: NewStudyCard): boolean => {
    const error = validateCard(input)
    if (error) {
      setMessage({ text: error, type: 'error' })
      return false
    }
    setCards([...cards, createCard(input)])
    setMessage({ text: CARD_MESSAGES.added, type: 'success' })
    return true
  }

  const handleToggle = (id: number) => {
    setCards(toggleCard(cards, id))
  }

  const handleDelete = (id: number) => {
    setCards(removeCard(cards, id))
    setMessage({ text: CARD_MESSAGES.deleted, type: 'success' })
  }

  const learnedCount = countLearned(cards)
  const visibleCards = filterCards(cards, search)

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
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
