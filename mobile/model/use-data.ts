import { useCallback, useEffect, useMemo, useState } from 'react'
import type { StudyCard } from '@deckly/shared/study-cards'
import type { DeckSummary, Scope, Stats } from '@deckly/shared/storage'
import { repository } from '../db/database'

const PAGE = 60
const SEARCH_DELAY_MS = 200

export const useDecks = (version: number): DeckSummary[] => useMemo(() => repository.listDecks(), [version])

export const useStats = (scope: Scope, version: number): Stats => {
  const key = scope.kind === 'deck' ? scope.id : ''
  return useMemo(() => repository.stats(key ? { kind: 'deck', id: key } : { kind: 'all' }), [key, version])
}

export const useDebouncedValue = (value: string): string => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [value])
  return debounced
}

export const useCardList = (scope: Scope, search: string, version: number) => {
  const key = scope.kind === 'deck' ? scope.id : ''
  const [pages, setPages] = useState(1)

  useEffect(() => setPages(1), [key, search])

  const { items, total } = useMemo(() => {
    const target: Scope = key ? { kind: 'deck', id: key } : { kind: 'all' }
    const loaded: StudyCard[] = []
    let count = 0
    for (let page = 0; page < pages; page += 1) {
      const result = repository.queryCards({ scope: target, search, offset: page * PAGE, limit: PAGE })
      loaded.push(...result.items)
      count = result.total
      if (result.items.length < PAGE) {
        break
      }
    }
    return { items: loaded, total: count }
  }, [key, search, pages, version])

  const loadMore = useCallback(() => {
    if (items.length < total) {
      setPages((value) => value + 1)
    }
  }, [items.length, total])

  return { items, total, loadMore }
}
