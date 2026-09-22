import { create } from 'zustand'
import type { Deck, ReviewMode } from '@/entities/deck'
import type { Rating } from '@/entities/card'
import { generateDeck } from '@/features/generate-deck'

export type SessionStatus = 'idle' | 'generating' | 'reviewing' | 'done'

type SessionState = {
  mode: ReviewMode
  deck: Deck | null
  index: number
  revealed: boolean
  ratings: Rating[]
  correct: number
  lastCorrect: boolean | null
  status: SessionStatus
  setMode: (mode: ReviewMode) => void
  generate: () => Promise<void>
  reveal: () => void
  flip: () => void
  rate: (rating: Rating) => void
  answer: (value: boolean) => void
  next: () => void
  reset: () => void
}

const cardState = {
  index: 0,
  revealed: false,
  ratings: [] as Rating[],
  correct: 0,
  lastCorrect: null as boolean | null,
}

export const useSessionStore = create<SessionState>((set, get) => ({
  mode: 'flip',
  deck: null,
  ...cardState,
  status: 'idle',

  setMode: (mode) => set({ mode }),

  generate: async () => {
    if (get().status === 'generating') {
      return
    }

    set({ status: 'generating' })
    const deck = await generateDeck(get().mode)
    set({ deck, ...cardState, status: 'reviewing' })
  },

  reveal: () => set({ revealed: true }),

  flip: () => set((state) => ({ revealed: !state.revealed })),

  rate: (rating) => {
    const { deck, index, ratings } = get()
    if (!deck || deck.mode !== 'qa') {
      return
    }

    const nextRatings = [...ratings, rating]
    const nextIndex = index + 1

    if (nextIndex >= deck.cards.length) {
      set({ ratings: nextRatings, status: 'done' })
      return
    }

    set({ ratings: nextRatings, index: nextIndex, revealed: false })
  },

  answer: (value) => {
    const { deck, index, correct, revealed } = get()
    if (!deck || deck.mode !== 'truefalse' || revealed) {
      return
    }

    const isCorrect = value === deck.cards[index].isTrue
    set({ revealed: true, lastCorrect: isCorrect, correct: correct + (isCorrect ? 1 : 0) })
  },

  next: () => {
    const { deck, index } = get()
    if (!deck) {
      return
    }

    const nextIndex = index + 1

    if (nextIndex >= deck.cards.length) {
      set({ status: 'done' })
      return
    }

    set({ index: nextIndex, revealed: false, lastCorrect: null })
  },

  reset: () => set({ deck: null, ...cardState, status: 'idle' }),
}))
