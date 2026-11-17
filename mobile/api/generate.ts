import Storage from 'expo-sqlite/kv-store'
import {
  CARD_COUNT_OPTIONS,
  DEFAULT_API_URL,
  DEFAULT_CARD_COUNT,
  type Deck,
  type DeckLanguage,
  type GenerateDeckParams,
} from '@shared/decks'
import { type GenerateDeckResult, requestDeck } from '@shared/decks/request'
import { deckSchema } from '@shared/decks/schema'

export type GenerateSettings = {
  topic: string
  count: number
  language: DeckLanguage
}

export type CachedGeneration = GenerateDeckResult & { fromCache: boolean }

const PREFIX = 'requests:'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const SETTINGS_KEY = 'generate:settings'
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL

const DEFAULT_SETTINGS: GenerateSettings = { topic: '', count: DEFAULT_CARD_COUNT, language: 'uk' }

const cacheKey = (params: GenerateDeckParams): string =>
  `deck:${params.mode}:${params.language}:${params.count}:${params.topic.trim().toLowerCase()}`

const read = (key: string): string | null => Storage.getItemSync(`${PREFIX}${key}`)

const write = (key: string, value: string): void => Storage.setItemSync(`${PREFIX}${key}`, value)

const remove = (key: string): void => {
  Storage.removeItemSync(`${PREFIX}${key}`)
}

const readJson = (key: string): unknown => {
  const raw = read(key)
  if (raw === null) {
    return undefined
  }
  try {
    return JSON.parse(raw)
  } catch {
    remove(key)
    return undefined
  }
}

const readCachedDeck = (key: string): Deck | null => {
  const entry = readJson(key)
  if (typeof entry !== 'object' || entry === null) {
    return null
  }
  const savedAt = Reflect.get(entry, 'savedAt')
  const deck = deckSchema.safeParse(Reflect.get(entry, 'deck'))
  if (typeof savedAt !== 'number' || Date.now() - savedAt > CACHE_TTL_MS || !deck.success) {
    remove(key)
    return null
  }
  return deck.data
}

export const generateDeck = async (
  params: GenerateDeckParams,
  fresh: boolean,
  signal?: AbortSignal,
): Promise<CachedGeneration> => {
  const key = cacheKey(params)
  const cached = fresh ? null : readCachedDeck(key)
  if (cached) {
    return { ok: true, deck: cached, fromCache: true }
  }
  const result = await requestDeck(API_URL, params, signal)
  if (result.ok) {
    write(key, JSON.stringify({ savedAt: Date.now(), deck: result.deck }))
  }
  return { ...result, fromCache: false }
}

export const loadSettings = (): GenerateSettings => {
  const value = readJson(SETTINGS_KEY)
  if (typeof value !== 'object' || value === null) {
    return DEFAULT_SETTINGS
  }
  const topic = Reflect.get(value, 'topic')
  const count = Reflect.get(value, 'count')
  const language = Reflect.get(value, 'language')
  return {
    topic: typeof topic === 'string' ? topic : DEFAULT_SETTINGS.topic,
    count: CARD_COUNT_OPTIONS.some((option) => option === count) ? Number(count) : DEFAULT_SETTINGS.count,
    language: language === 'en' ? 'en' : 'uk',
  }
}

export const saveSettings = (settings: GenerateSettings): void => {
  write(SETTINGS_KEY, JSON.stringify(settings))
}
