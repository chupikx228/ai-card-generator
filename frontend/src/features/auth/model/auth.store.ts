import { create } from 'zustand'
import { type User, userSchema } from '@/entities/user'
import { z } from 'zod'
import { type AuthPayload, type LoginParams, type RegisterParams, requestLogin, requestMe, requestRegister } from '../api/auth'
import { getAuthErrorMessage } from './error-message'

type AuthStatus = 'idle' | 'submitting'

type AuthState = {
  user: User | null
  token: string | null
  status: AuthStatus
  error: string | null
  login: (params: LoginParams) => Promise<boolean>
  register: (params: RegisterParams) => Promise<boolean>
  logout: () => void
  verify: () => Promise<void>
  clearError: () => void
}

const STORAGE_KEY = 'deckly-auth'

const storedSessionSchema = z.object({ token: z.string(), user: userSchema })

const readSession = (): AuthPayload | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = storedSessionSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

const writeSession = (session: AuthPayload | null): void => {
  try {
    if (session) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    return
  }
}

const initialSession = typeof window === 'undefined' ? null : readSession()

export const useAuthStore = create<AuthState>((set, get) => {
  const submit = async (action: () => Promise<AuthPayload>): Promise<boolean> => {
    if (get().status === 'submitting') {
      return false
    }
    set({ status: 'submitting', error: null })
    try {
      const session = await action()
      writeSession(session)
      set({ user: session.user, token: session.token, status: 'idle' })
      return true
    } catch (error) {
      set({ status: 'idle', error: getAuthErrorMessage(error) })
      return false
    }
  }

  return {
    user: initialSession?.user ?? null,
    token: initialSession?.token ?? null,
    status: 'idle',
    error: null,

    login: (params) => submit(() => requestLogin(params)),

    register: (params) => submit(() => requestRegister(params)),

    logout: () => {
      writeSession(null)
      set({ user: null, token: null, error: null })
    },

    verify: async () => {
      const { token } = get()
      if (!token) {
        return
      }
      try {
        const user = await requestMe(token)
        if (!user) {
          get().logout()
          return
        }
        writeSession({ token, user })
        set({ user })
      } catch {
        return
      }
    },

    clearError: () => set({ error: null }),
  }
})
