import { z } from 'zod'
import { type User, userSchema } from '@/entities/user'
import { requestGraphql } from '@/shared/api'

const USER_FIELDS = 'id name email'

const authPayloadSchema = z.object({ token: z.string(), user: userSchema })

export type AuthPayload = z.infer<typeof authPayloadSchema>

export type LoginParams = {
  email: string
  password: string
}

export type RegisterParams = LoginParams & {
  name: string
}

export const requestLogin = async (params: LoginParams): Promise<AuthPayload> => {
  const data = await requestGraphql(
    {
      query: `mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token user { ${USER_FIELDS} } } }`,
      variables: params,
    },
    z.object({ login: authPayloadSchema }),
  )
  return data.login
}

export const requestRegister = async (params: RegisterParams): Promise<AuthPayload> => {
  const data = await requestGraphql(
    {
      query: `mutation Register($name: String!, $email: String!, $password: String!) { register(name: $name, email: $email, password: $password) { token user { ${USER_FIELDS} } } }`,
      variables: params,
    },
    z.object({ register: authPayloadSchema }),
  )
  return data.register
}

export const requestMe = async (token: string): Promise<User | null> => {
  const data = await requestGraphql(
    { query: `query Me { me { ${USER_FIELDS} } }`, token },
    z.object({ me: userSchema.nullable() }),
  )
  return data.me
}
