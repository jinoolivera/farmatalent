import { api } from './client'

export async function fetchMyApplications(params = {}) {
  const { data } = await api.get('/shifts/mine', { params })
  return data
}

export async function fetchCompanyApplications(params = {}) {
  const { data } = await api.get('/shift-applications', { params })
  return data
}

export async function fetchApplicationById(applicationId) {
  const { data } = await api.get(`/shift-applications/${applicationId}`)
  return data
}

export async function applyToShift(shiftId, payload = {}) {
  const { data } = await api.post(`/shifts/${shiftId}/apply`, payload)
  return data
}

export async function withdrawApplication(applicationId) {
  const { data } = await api.post(`/shift-applications/${applicationId}/withdraw`)
  return data
}

export async function reviewApplication(applicationId, payload) {
  const { data } = await api.post(`/shift-applications/${applicationId}/review`, payload)
  return data
}
