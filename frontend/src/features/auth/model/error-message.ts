import { ApiError, CLIENT_ERROR_CODES } from '@/shared/api'

const DEFAULT_MESSAGE = 'Щось пішло не так. Спробуй ще раз.'

export const getAuthErrorMessage = (error: unknown): string => {
  if (!(error instanceof ApiError)) {
    return DEFAULT_MESSAGE
  }
  if (error.code === CLIENT_ERROR_CODES.network) {
    return 'Сервер авторизації недоступний. Перевір, що GraphQL-сервер запущено.'
  }
  if (error.code === 'BAD_USER_INPUT') {
    return error.message
  }
  return DEFAULT_MESSAGE
}
