export const GENERATE_DECK_PATH = '/decks/generate'

export const DEFAULT_API_URL = 'https://ai-card-generator.onrender.com/api'

export const CARD_COUNT_OPTIONS = [5, 10, 15] as const

export const DEFAULT_CARD_COUNT = 10

export const TOPIC_LIMITS = {
  minLength: 3,
  maxLength: 200,
} as const

export const CLIENT_ERROR_CODES = {
  network: 'NETWORK_ERROR',
  invalidResponse: 'INVALID_RESPONSE',
  unknown: 'UNKNOWN_ERROR',
  aborted: 'ABORTED',
} as const

const DEFAULT_MESSAGE = 'Щось пішло не так. Спробуй ще раз.'

const GENERATION_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'Перевір тему: від 3 до 200 символів.',
  TOPIC_REJECTED: 'Цю тему не можна згенерувати. Спробуй іншу.',
  GENERATION_FAILED: 'Модель зараз недоступна. Спробуй ще раз за хвилину.',
  [CLIENT_ERROR_CODES.network]: 'Немає з’єднання з сервером. Перевір інтернет і спробуй ще раз.',
}

export const getGenerationErrorMessage = (code: string): string => GENERATION_MESSAGES[code] ?? DEFAULT_MESSAGE
