import { DEFAULT_API_URL } from '@deckly/shared/decks'
import { type GenerateDeckResult, isGenerateDeckParams, requestDeck } from '@deckly/shared/decks/request'

const active = new Map<string, AbortController>()

const isRequestId = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 64

export const cancelGenerate = (requestId: unknown): void => {
  if (isRequestId(requestId)) {
    active.get(requestId)?.abort()
    active.delete(requestId)
  }
}

export const cancelAllGenerations = (): void => {
  active.forEach((controller) => controller.abort())
  active.clear()
}

export const generateDeck = async (params: unknown, requestId: unknown): Promise<GenerateDeckResult> => {
  if (!isGenerateDeckParams(params) || !isRequestId(requestId)) {
    return { ok: false, code: 'VALIDATION_FAILED' }
  }
  cancelGenerate(requestId)
  const controller = new AbortController()
  active.set(requestId, controller)
  try {
    return await requestDeck(process.env.DECKLY_API_URL ?? DEFAULT_API_URL, params, controller.signal)
  } finally {
    if (active.get(requestId) === controller) {
      active.delete(requestId)
    }
  }
}
