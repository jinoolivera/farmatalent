import { api } from './client'

export async function fetchShifts(params = {}) {
  const { data } = await api.get('/shifts', { params })
  return data
}

export async function fetchShiftById(shiftId) {
  const { data } = await api.get(`/shifts/${shiftId}`)
  return data
}

export async function createShift(payload) {
  const { data } = await api.post('/shifts', payload)
  return data
}

export async function updateShift(shiftId, payload) {
  const { data } = await api.put(`/shifts/${shiftId}`, payload)
  return data
}

export async function deleteShift(shiftId) {
  const { data } = await api.delete(`/shifts/${shiftId}`)
  return data
}
