import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function RequireRole({ roles = [] }) {
  const { user } = useAuth()
  const userRoles = user?.roles?.map((role) => role.slug ?? role.name) ?? []
  const requiresCompanyScope = roles.some((role) => role.startsWith('company-'))
  const hasCompanyAccess = requiresCompanyScope && (user?.companies?.length ?? 0) > 0
  const hasRequiredRole = roles.length === 0 || roles.some((role) => userRoles.includes(role)) || hasCompanyAccess

  if (!hasRequiredRole) {
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
