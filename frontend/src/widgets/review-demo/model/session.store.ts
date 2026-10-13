import { create } from 'zustand'
import type { Deck, DeckLanguage, ReviewMode } from '@/entities/deck'
import type { Rating } from '@/entities/card'
import { DEFAULT_CARD_COUNT, requestDeckGeneration } from '@/features/generate-deck'
import { ApiError, CLIENT_ERROR_CODES } from '@/shared/api'

export type SessionStatus = 'idle' | 'generating' | 'reviewing' | 'done'

type SessionState = {
  mode: ReviewMode
  topic: string
  language: DeckLanguage
  count: number
  errorCode: string | null
  deck: Deck | null
  index: number
  revealed: boolean
  ratings: Rating[]
  correct: number
  lastCorrect: boolean | null
  status: SessionStatus
  setMode: (mode: ReviewMode) => void
  setTopic: (topic: string) => void
  setLanguage: (language: DeckLanguage) => void
  setCount: (count: number) => void
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
  topic: '',
  language: 'uk',
  count: DEFAULT_CARD_COUNT,
  errorCode: null,
  deck: null,
  ...cardState,
  status: 'idle',

  setMode: (mode) => set({ mode }),

  setTopic: (topic) => set({ topic }),

  setLanguage: (language) => set({ language }),

  setCount: (count) => set({ count }),

  generate: async () => {
    const { status, topic, mode, language, count } = get()
    if (status === 'generating') {
      return
    }

    set({ status: 'generating', errorCode: null })

    try {
      const deck = await requestDeckGeneration({ topic: topic.trim(), mode, language, count })
      set({ deck, ...cardState, status: 'reviewing' })
    } catch (error) {
      set({
        status: 'idle',
        errorCode: error instanceof ApiError ? error.code : CLIENT_ERROR_CODES.unknown,
      })
    }
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
