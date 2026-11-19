import { CLIENT_ERROR_CODES, GENERATE_DECK_PATH, TOPIC_LIMITS } from './endpoint.ts'
import type { Deck, GenerateDeckParams } from './model.ts'
import { apiErrorBodySchema, deckSchema } from './schema.ts'

export type GenerateDeckResult = { ok: true; deck: Deck } | { ok: false; code: string }

const REQUEST_TIMEOUT_MS = 90_000
const MODES = ['flip', 'qa', 'truefalse']
const LANGUAGES = ['uk', 'en']

export const isGenerateDeckParams = (value: unknown): value is GenerateDeckParams => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const topic = Reflect.get(value, 'topic')
  const count = Reflect.get(value, 'count')
  return (
    typeof topic === 'string' &&
    topic.trim().length >= TOPIC_LIMITS.minLength &&
    topic.length <= TOPIC_LIMITS.maxLength &&
    MODES.includes(String(Reflect.get(value, 'mode'))) &&
    LANGUAGES.includes(String(Reflect.get(value, 'language'))) &&
    typeof count === 'number' &&
    Number.isInteger(count)
  )
}

export const requestDeck = async (
  apiUrl: string,
  params: GenerateDeckParams,
  signal?: AbortSignal,
): Promise<GenerateDeckResult> => {
  if (signal?.aborted) {
    return { ok: false, code: CLIENT_ERROR_CODES.aborted }
  }

  const controller = new AbortController()
  const abort = () => controller.abort()
  const timer = setTimeout(abort, REQUEST_TIMEOUT_MS)
  signal?.addEventListener('abort', abort)

  try {
    const response = await fetch(`${apiUrl.replace(/\/+$/, '')}${GENERATE_DECK_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, topic: params.topic.trim() }),
      signal: controller.signal,
    })
    const body: unknown = await response.json().catch(() => null)

    if (signal?.aborted) {
      return { ok: false, code: CLIENT_ERROR_CODES.aborted }
    }
    if (!response.ok) {
      const error = apiErrorBodySchema.safeParse(body)
      return { ok: false, code: error.success ? error.data.code : CLIENT_ERROR_CODES.unknown }
    }
    const deck = deckSchema.safeParse(body)
    return deck.success ? { ok: true, deck: deck.data } : { ok: false, code: CLIENT_ERROR_CODES.invalidResponse }
  } catch {
    return { ok: false, code: signal?.aborted ? CLIENT_ERROR_CODES.aborted : CLIENT_ERROR_CODES.network }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}
