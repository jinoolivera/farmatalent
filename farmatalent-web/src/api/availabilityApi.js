import { api } from './client'

/**
 * GET /professional/profile — returns ProfessionalProfileResource
 * which includes `availability` (array) and `is_available` (boolean).
 */
export async function fetchProfessionalProfile() {
  const { data } = await api.get('/professional/profile')
  // JsonResource wraps in { data: {...} } when returned directly from controller
  return data?.data ?? data
}

/**
 * PUT /professional/profile — update profile fields.
 * Use { availability: [...slotKeys] } to save the weekly schedule.
 */
export async function updateAvailability(payload) {
  const { data } = await api.put('/professional/profile', payload)
  return data?.data ?? data
}

/**
 * POST /professional/availability — toggle is_available boolean.
 * Backend accepts { is_available: boolean }.
 */
export async function updateAvailableNow(is_available) {
  const { data } = await api.post('/professional/availability', { is_available })
  return data?.data ?? data
}
