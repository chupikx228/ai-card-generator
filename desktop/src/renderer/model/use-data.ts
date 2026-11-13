import { useCallback, useEffect, useRef, useState } from 'react'
import type { StudyCard } from '@shared/study-cards'
import type { DeckSummary, Scope, Stats } from '../../ipc/contract'

const PAGE_SIZE = 120
const SEARCH_DELAY_MS = 150

const scopeKey = (scope: Scope): string => (scope.kind === 'deck' ? `deck:${scope.id}` : 'all')

export const useDecks = (version: number): DeckSummary[] | null => {
  const [decks, setDecks] = useState<DeckSummary[] | null>(null)
  useEffect(() => {
    let active = true
    void window.cardsAPI.listDecks().then((loaded) => {
      if (active) {
        setDecks(loaded)
      }
    })
    return () => {
      active = false
    }
  }, [version])
  return decks
}

export const useStats = (scope: Scope, version: number): Stats => {
  const [stats, setStats] = useState<Stats>({ total: 0, learned: 0 })
  const deckId = scope.kind === 'deck' ? scope.id : null
  useEffect(() => {
    let active = true
    void window.cardsAPI.stats(deckId ? { kind: 'deck', id: deckId } : { kind: 'all' }).then((loaded) => {
      if (active) {
        setStats(loaded)
      }
    })
    return () => {
      active = false
    }
  }, [deckId, version])
  return stats
}

export const useDebouncedValue = <T>(value: T, delay = SEARCH_DELAY_MS): T => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

type Page = {
  generation: number
  items: StudyCard[]
}

export type CardPages = {
  total: number | null
  getItem: (index: number) => StudyCard | undefined
  requestRange: (from: number, to: number) => void
}

export const useCardPages = (scope: Scope, search: string, version: number): CardPages => {
  const queryKey = `${scopeKey(scope)}|${search}`
  const [total, setTotal] = useState<number | null>(null)
  const [, setTick] = useState(0)
  const pages = useRef(new Map<number, Page>())
  const inflight = useRef(new Set<string>())
  const current = useRef({ queryKey, version, scope, search })

  if (current.current.queryKey !== queryKey) {
    pages.current = new Map()
    inflight.current = new Set()
  }
  current.current = { queryKey, version, scope, search }

  useEffect(() => {
    setTotal(null)
  }, [queryKey])

  const requestRange = useCallback((from: number, to: number) => {
    const { queryKey: key, version: generation, scope: target, search: text } = current.current
    const first = Math.max(0, Math.floor(from / PAGE_SIZE))
    const last = Math.max(first, Math.floor(Math.max(0, to) / PAGE_SIZE))
    for (let page = first; page <= last; page += 1) {
      const cached = pages.current.get(page)
      const ticket = `${key}|${generation}|${page}`
      if ((cached && cached.generation === generation) || inflight.current.has(ticket)) {
        continue
      }
      inflight.current.add(ticket)
      void window.cardsAPI
        .queryCards({ scope: target, search: text, offset: page * PAGE_SIZE, limit: PAGE_SIZE })
        .then((result) => {
          inflight.current.delete(ticket)
          if (current.current.queryKey !== key) {
            return
          }
          pages.current.set(page, { generation, items: result.items })
          setTotal(result.total)
          setTick((tick) => tick + 1)
        })
    }
  }, [])

  useEffect(() => {
    requestRange(0, 0)
  }, [queryKey, version, requestRange])

  const getItem = useCallback(
    (index: number) => pages.current.get(Math.floor(index / PAGE_SIZE))?.items[index % PAGE_SIZE],
    [],
  )

  return { total, getItem, requestRange }
}
