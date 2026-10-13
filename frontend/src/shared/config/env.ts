import { z } from 'zod'

const DEFAULT_API_URL = 'http://localhost:3000/api'

const apiUrlSchema = z
  .url()
  .default(DEFAULT_API_URL)
  .transform((url) => url.replace(/\/+$/, ''))

export const API_URL = apiUrlSchema.parse(import.meta.env.VITE_API_URL || undefined)
