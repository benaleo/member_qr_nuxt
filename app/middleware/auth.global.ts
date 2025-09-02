export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('auth_token')
  const roles = useCookie<string | null>('auth_roles')
  const role = useCookie<string | null>('auth_role')

  const isPublic = to.path === '/' || to.path === '/login'

  function parseRoleNames(): string[] {
    try {
      if (!roles.value) {
        // Fallback to single role cookie
        return role.value ? [role.value.toUpperCase()] : []
      }
      const parsed = JSON.parse(roles.value)
      // If it's a single string
      if (typeof parsed === 'string') return [parsed.toUpperCase()]
      // If it's an array of strings
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
        return parsed.map((v: string) => v.toUpperCase())
      }
      // If it's an array of objects with name
      if (Array.isArray(parsed)) {
        return parsed
          .map((it: any) => (typeof it?.name === 'string' ? it.name.toUpperCase() : ''))
          .filter(Boolean)
      }
      // If it's an object with name
      if (parsed && typeof parsed === 'object' && typeof parsed.name === 'string') {
        return [parsed.name.toUpperCase()]
      }
      // As a final fallback, check single role cookie
      return role.value ? [role.value.toUpperCase()] : []
    } catch {
      return role.value ? [role.value.toUpperCase()] : []
    }
  }

  function hasAdmin(names: string[]): boolean {
    return names.some((n) => n === 'ADMIN' || n === 'SUPERADMIN')
  }

  // Not logged in → allow only '/' and '/login'
  if (!token.value) {
    if (!isPublic) return navigateTo('/login')
    return
  }

  // Logged in → prevent going back to '/' or '/login'
  if (isPublic) {
    const names = parseRoleNames()
    const isAdmin = hasAdmin(names)
    return navigateTo(isAdmin ? '/console' : '/home')
  }

  // Admin-only route protection
  if (to.path === '/console') {
    const names = parseRoleNames()
    const isAdmin = hasAdmin(names)
    if (!isAdmin) return navigateTo('/home')
  }
})
