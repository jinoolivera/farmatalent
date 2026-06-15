export function isCompanyAccount(user) {
  const roles = user?.roles?.map((role) => role.slug ?? role.name) ?? []
  const hasCompanyRole = roles.some((role) => String(role).startsWith('company-'))
  const hasCompanyMembership = (user?.companies?.length ?? 0) > 0

  return hasCompanyRole || hasCompanyMembership
}

export function getPostLoginPath(user) {
  if (isCompanyAccount(user)) {
    return '/app/farmacia'
  }

  return '/app'
}
