export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('auth_token')
  const roles = useCookie<string | null>('auth_roles')
  const role = useCookie<string | null>('auth_role')

  const isPublic = to.path === '/' || to.path === '/login' || to.path === '/register'

  if (process.client) {
    // Debug current route and cookie snapshot
    console.debug('[AuthMW] to.path =', to.path)
    console.debug('[AuthMW] token.value =', token.value)
    console.debug('[AuthMW] document.cookie =', document.cookie)
  }

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

  // Not logged in → allow only '/' and '/login' and '/register'
  if (!token.value) {
    // If on client and cookie was just written but composable not yet updated, trust document.cookie
    if (
      process.client && typeof document !== 'undefined' && (
        document.cookie.includes('auth_token=') ||
        document.cookie.includes('auth_roles=') ||
        document.cookie.includes('auth_role=')
      )
    ) {
      return
    }
    if (!isPublic) return navigateTo('/login')
    return
  }

  // Logged in → prevent going back to '/' or '/login' or '/register'
  if (isPublic) {
    const names = parseRoleNames()
    const isAdmin = hasAdmin(names)
    return navigateTo(isAdmin ? '/console' : '/home')
  }

  // Admin-only route protection for /console and all subpaths
  if (to.path === '/console' || to.path.startsWith('/console/')) {
    const names = parseRoleNames()
    const isAdmin = hasAdmin(names)
    if (!isAdmin) return navigateTo('/home')
  }
})
