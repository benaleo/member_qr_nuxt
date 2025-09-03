// Client-side GraphQL API helper for authentication
// Uses Nuxt runtime config `public.graphqlEndpoint`

import { gqlFetch } from '~/utils/graphql'

export type RegisterInput = {
  name: string
  username: string
  password: string
  email?: string
}

export type RegisterResponse = {
  user: {
    name: string
    username: string
    email?: string | null
  }
  token: string
}

const REGISTER = /* GraphQL */ `
  mutation Register($name: String!, $username: String!, $password: String!, $email: String) {
    register(
      name: $name
      username: $username
      password: $password
      email: $email
    ) {
      user {
        name
        username
        email
      }
      token
    }
  }
`

export async function registerApi(input: RegisterInput): Promise<RegisterResponse> {
  const data = await gqlFetch<{ register: RegisterResponse }>(REGISTER, input)
  return data.register
}

export type LoginInput = {
  username: string
  password: string
}

export type Role = { name: string }

export type LoginUser = {
  id: string
  name: string
  username: string
  roles?: Role[]
}

export type LoginPayload = {
  user: LoginUser
  token: string
}

export type GraphQLErrorItem = {
  message: string
  path?: (string | number)[]
  extensions?: Record<string, any>
}

export type GraphQLResponse<T> = {
  data?: T
  errors?: GraphQLErrorItem[]
}

const LOGIN_MUTATION = /* GraphQL */ `
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    user { id name username role { name } }
    token
  }
}`

/**
 * Perform login against GraphQL endpoint.
 * Logs request/response to aid network inspection and debugging.
 */
export async function loginApi(input: LoginInput): Promise<LoginPayload> {
  const config = useRuntimeConfig()
  const endpoint = config.public.graphqlEndpoint
  
  if (!endpoint) {
    throw new Error('GraphQL endpoint is not configured. Please set public.graphqlEndpoint in your Nuxt config.')
  }

  // Minimal request logger
  if (process.client) {
    console.groupCollapsed('[GraphQL] Request → login')
    console.info('Endpoint:', endpoint)
    console.info('Query:', LOGIN_MUTATION)
    console.info('Variables:', { ...input, password: '••••••' })
    console.groupEnd()
  }

  const res = await $fetch<GraphQLResponse<{ login: LoginPayload }>>(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      query: LOGIN_MUTATION,
      variables: input,
    },
  })

  // Minimal response logger
  if (process.client) {
    console.groupCollapsed('[GraphQL] Response ← login')
    console.info('Body:', res)
    console.groupEnd()
  }

  if (res.errors?.length) {
    const message = res.errors.map(e => e.message).join('; ')
    throw new Error(message || 'Login failed')
  }

  const payload = res.data?.login
  if (!payload) throw new Error('Invalid server response')
  return payload
}
