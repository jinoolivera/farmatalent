export const APP_MODE_KEY = 'farmatalent_app_mode'

export function hasCompanyAccount(user) {
  const roles = user?.roles?.map((role) => role.slug ?? role.name) ?? []
  const hasCompanyRole = roles.some((role) => String(role).startsWith('company-'))
  const hasCompanyMembership = (user?.companies?.length ?? 0) > 0

  return hasCompanyRole || hasCompanyMembership
}

export function hasProfessionalAccount(user) {
  return Boolean(user?.professional_type)
}

export function getStoredAppMode() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(APP_MODE_KEY)
}

export function resolveAppMode(user, preferredMode = null) {
  const canUseProfessional = hasProfessionalAccount(user)
  const canUseCompany = hasCompanyAccount(user)

  if (preferredMode === 'company' && canUseCompany) return 'company'
  if (preferredMode === 'professional' && canUseProfessional) return 'professional'
  if (canUseProfessional) return 'professional'
  if (canUseCompany) return 'company'
  return null
}

export function isCompanyAccount(user, mode = null) {
  return resolveAppMode(user, mode ?? getStoredAppMode()) === 'company'
}

export function getPostLoginPath(user, preferredMode = null) {
  const mode = resolveAppMode(user, preferredMode ?? getStoredAppMode())

  if (mode === 'company') {
    return '/app/farmacia'
  }

  if (mode === 'professional') {
    return '/app'
  }

  if (!hasProfessionalAccount(user) && !hasCompanyAccount(user)) {
    return '/app/empezar'
  }

  return '/app/empezar'
}
