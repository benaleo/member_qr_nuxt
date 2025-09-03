import { useRuntimeConfig, useCookie } from 'nuxt/app'

export type GraphQLErrorItem = {
  message: string
  path?: (string | number)[]
  extensions?: Record<string, any>
}

export type GraphQLResponse<T> = {
  data?: T
  errors?: GraphQLErrorItem[]
}

export async function gqlFetch<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const config = useRuntimeConfig()
  const endpoint = config.public.graphqlEndpoint
  if (!endpoint) throw new Error('GraphQL endpoint not configured')

  const token = useCookie<string | null>('auth_token').value

  const res = await $fetch<GraphQLResponse<T>>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: { query, variables },
  })

  if (res.errors?.length) {
    const message = res.errors.map(e => e.message).join('; ')
    throw new Error(message || 'GraphQL error')
  }
  if (!res.data) throw new Error('No data')
  return res.data
}
