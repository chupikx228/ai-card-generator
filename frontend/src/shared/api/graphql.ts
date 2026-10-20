import { z } from 'zod'
import { GRAPHQL_URL } from '@/shared/config'
import { ApiError, CLIENT_ERROR_CODES } from './api-error'

const graphqlErrorSchema = z.object({
  message: z.string(),
  extensions: z.object({ code: z.string().optional() }).optional(),
})

const responseSchema = z.object({
  data: z.unknown().optional(),
  errors: z.array(graphqlErrorSchema).optional(),
})

type GraphqlRequest = {
  query: string
  variables?: Record<string, unknown>
  token?: string | null
}

export const requestGraphql = async <T>(request: GraphqlRequest, dataSchema: z.ZodType<T>): Promise<T> => {
  let response: Response
  try {
    response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.token ? { Authorization: `Bearer ${request.token}` } : {}),
      },
      body: JSON.stringify({ query: request.query, variables: request.variables }),
    })
  } catch {
    throw new ApiError(0, CLIENT_ERROR_CODES.network, 'Network request failed')
  }

  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }

  const parsed = responseSchema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError(response.status, CLIENT_ERROR_CODES.invalidResponse, `Request failed with ${response.status}`)
  }

  const [firstError] = parsed.data.errors ?? []
  if (firstError) {
    throw new ApiError(response.status, firstError.extensions?.code ?? CLIENT_ERROR_CODES.unknown, firstError.message)
  }

  const data = dataSchema.safeParse(parsed.data.data)
  if (!data.success) {
    throw new ApiError(response.status, CLIENT_ERROR_CODES.invalidResponse, z.prettifyError(data.error))
  }

  return data.data
}
