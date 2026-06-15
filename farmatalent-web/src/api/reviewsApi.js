import { api } from './client'

export async function submitReview(applicationId, payload) {
  const { data } = await api.post(`/shift-applications/${applicationId}/review`, payload)
  return data
}

export async function fetchReview(applicationId) {
  const { data } = await api.get(`/shift-applications/${applicationId}/review`)
  return data
}
