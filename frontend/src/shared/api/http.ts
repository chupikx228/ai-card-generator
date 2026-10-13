import { z } from 'zod'
import { API_URL } from '@/shared/config'
import { ApiError, CLIENT_ERROR_CODES } from './api-error'

const errorBodySchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
})

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const send = async (path: string, init: RequestInit): Promise<Response> => {
  try {
    return await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })
  } catch {
    throw new ApiError(0, CLIENT_ERROR_CODES.network, 'Network request failed')
  }
}

const request = async <T>(path: string, schema: z.ZodType<T>, init: RequestInit): Promise<T> => {
  const response = await send(path, init)
  const body = await readJson(response)

  if (!response.ok) {
    const error = errorBodySchema.safeParse(body)
    throw error.success
      ? new ApiError(response.status, error.data.code, error.data.message)
      : new ApiError(response.status, CLIENT_ERROR_CODES.unknown, `Request failed with ${response.status}`)
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    throw new ApiError(response.status, CLIENT_ERROR_CODES.invalidResponse, z.prettifyError(result.error))
  }

  return result.data
}

export const postJson = <T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> =>
  request(path, schema, { method: 'POST', body: JSON.stringify(body) })
