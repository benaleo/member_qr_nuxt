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

async function gqlFetch<T>(query: string, variables?: Record<string, any>): Promise<T> {
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

// Queries
const GET_GAMIFICATIONS = /* GraphQL */ `
query GetGamification {
  getGamifications {
    items { id name point description code }
    page_info { current_page }
  }
}`

const GET_BY_CODE = /* GraphQL */ `
query GetByCode($code: String!) {
  getGamificationsByCode(code: $code) { id name point description }
}`

const EXIST_USER_IN_GAMIFICATION = /* GraphQL */ `
query existUserInGamification($user_id: Int!, $gamification_id: Int!, $date: String!) {
  getLogGamificationByUserIdAndGamificationIdAndDate(
    user_id: $user_id
    gamification_id: $gamification_id
    date: $date
  )
}`

const GET_LOG_GAMIFICATIONS = /* GraphQL */ `
query getLogGamification($input: PaginationInput!, $user_id: Int!) {
  getLogGamifications(input: $input, user_id: $user_id) {
    items { id gamification { name } message point }
    page_info {
      current_page per_page total_items total_pages has_next_page has_previous_page start_item end_item
    }
  }
}`

// Mutation (adjusted to backend: separate arguments, no input object)
const CREATE_LOG_GAMIFICATION = /* GraphQL */ `
mutation CreateLogGamification(
  $user_id: Int!
  $gamification_id: Int!
  $message: String!
  $point: Int!
  $date: String!
) {
  createLogGamification(
    user_id: $user_id
    gamification_id: $gamification_id
    message: $message
    point: $point
    date: $date
  ) {
    id
    message
    point
    gamification { id name }
  }
}`

// Types
export type Gamification = { id: number; name: string; point: number; description?: string; code?: string }
export type GamificationList = { items: Gamification[]; page_info: { current_page: number } }

export async function getGamifications() {
  const data = await gqlFetch<{ getGamifications: GamificationList }>(GET_GAMIFICATIONS)
  return data.getGamifications
}

export async function getGamificationByCode(code: string) {
  const data = await gqlFetch<{ getGamificationsByCode: Gamification | null }>(GET_BY_CODE, { code })
  return data.getGamificationsByCode
}

export async function existsUserInGamification(userId: number, gamificationId: number, date: string) {
  const data = await gqlFetch<{ getLogGamificationByUserIdAndGamificationIdAndDate: any }>(
    EXIST_USER_IN_GAMIFICATION,
    { user_id: userId, gamification_id: gamificationId, date }
  )
  return Boolean(data.getLogGamificationByUserIdAndGamificationIdAndDate)
}

export type LogItem = { id: number; gamification: { name: string }; message: string; point: number }
export type LogList = { items: LogItem[]; page_info: { current_page: number; per_page: number; total_items: number; total_pages: number; has_next_page: boolean; has_previous_page: boolean; start_item: number; end_item: number } }

export async function getLogGamifications(userId: number, page = 1, limit = 10) {
  const data = await gqlFetch<{ getLogGamifications: LogList }>(GET_LOG_GAMIFICATIONS, {
    input: { limit, page },
    user_id: userId,
  })
  return data.getLogGamifications
}

// Create log after successful validation
export async function createLogGamification(
  userId: number,
  gamificationId: number,
  date: string,
  message?: string,
  point?: number
) {
  const variables = {
    user_id: userId,
    gamification_id: gamificationId,
    date,
    message: message ?? '',
    point: point ?? 0,
  }
  const data = await gqlFetch<{ createLogGamification: LogItem }>(CREATE_LOG_GAMIFICATION, variables)
  return data.createLogGamification
}
