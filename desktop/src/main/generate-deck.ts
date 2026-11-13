import {
  CLIENT_ERROR_CODES,
  DEFAULT_API_URL,
  GENERATE_DECK_PATH,
  type GenerateDeckParams,
  TOPIC_LIMITS,
} from '@shared/decks'
import { apiErrorBodySchema, deckSchema } from '@shared/decks/schema'
import type { GenerateDeckResult } from '../ipc/contract'

const REQUEST_TIMEOUT_MS = 90_000
const MODES = ['flip', 'qa', 'truefalse']
const LANGUAGES = ['uk', 'en']

const apiUrl = (): string => (process.env.DECKLY_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '')

const isValidParams = (value: unknown): value is GenerateDeckParams => {
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

export const generateDeck = async (params: unknown): Promise<GenerateDeckResult> => {
  if (!isValidParams(params)) {
    return { ok: false, code: 'VALIDATION_FAILED' }
  }

  let response: Response
  try {
    response = await fetch(`${apiUrl()}${GENERATE_DECK_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, topic: params.topic.trim() }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    return { ok: false, code: CLIENT_ERROR_CODES.network }
  }

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = apiErrorBodySchema.safeParse(body)
    return { ok: false, code: error.success ? error.data.code : CLIENT_ERROR_CODES.unknown }
  }

  const deck = deckSchema.safeParse(body)
  return deck.success ? { ok: true, deck: deck.data } : { ok: false, code: CLIENT_ERROR_CODES.invalidResponse }
}
