import { api } from './client'

export async function fetchNotifications() {
  const { data } = await api.get('/notifications')
  return data
}

export async function markNotificationRead(id) {
  const { data } = await api.post(`/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await api.post('/notifications/read-all')
  return data
}
