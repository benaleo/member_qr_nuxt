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

// Queries / Mutations
const GET_USERS = /* GraphQL */ `
query GetUser($keyword: String, $input: PaginationInput!) {
  getUsers(input: $input, keyword: $keyword) {
    items { id name username avatar is_active }
    page_info { current_page }
  }
}`

// The backend names this as a query in schema notes, but it's a state-changing operation.
// We'll call it via GraphQL mutation.
const APPROVAL_USER = /* GraphQL */ `
mutation ApprovalUser($id: Int!, $is_active: Boolean!) {
  approvalUser(id: $id, is_active: $is_active) {
    id
    name
    username
    avatar
    is_active
  }
}`

export type User = { id: number; name: string; username: string; avatar?: string | null }
export type UserList = { items: User[]; page_info: { current_page: number } }

export async function getUsers(keyword: string | undefined, page = 1, limit = 10) {
  const data = await gqlFetch<{ getUsers: UserList }>(GET_USERS, { input: { limit, page }, keyword })
  return data.getUsers
}

export async function approvalUser(id: number, isActive: boolean) {
  const data = await gqlFetch<{ approvalUser: User }>(APPROVAL_USER, { id, is_active: isActive })
  return data.approvalUser
}
