import { api } from './client'

/**
 * GET /profile — returns { profile: User } (raw model with relations loaded).
 * We unwrap to return the User object directly.
 */
export async function fetchProfile() {
  const { data } = await api.get('/profile')
  return data?.profile ?? data
}

/**
 * PUT /profile — returns { profile: UserResource }.
 * Accepts: name, professional_type, professional_profile.* fields.
 */
export async function updateProfile(payload) {
  const { data } = await api.put('/profile', payload)
  return data?.profile ?? data
}

/**
 * GET /stats/professionals — devuelve el conteo real de profesionales activos.
 * Endpoint público — no requiere autenticación.
 * Devuelve { count, display } donde display = Math.max(50, count).
 */
export async function fetchProfessionalsCount() {
  try {
    const { data } = await api.get('/stats/professionals')
    return data?.display ?? data?.count ?? null
  } catch {
    return null
  }
}
