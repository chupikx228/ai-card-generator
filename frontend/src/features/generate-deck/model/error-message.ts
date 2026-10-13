import { CLIENT_ERROR_CODES } from '@/shared/api'

const DEFAULT_MESSAGE = 'Щось пішло не так. Спробуй ще раз.'

const MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'Перевір тему: від 3 до 200 символів.',
  TOPIC_REJECTED: 'Цю тему не можна згенерувати. Спробуй іншу.',
  GENERATION_FAILED: 'Модель зараз недоступна. Спробуй ще раз за хвилину.',
  [CLIENT_ERROR_CODES.network]: 'Сервер недоступний. Перевір, що бекенд запущено.',
}

export const getGenerationErrorMessage = (code: string): string => MESSAGES[code] ?? DEFAULT_MESSAGE
