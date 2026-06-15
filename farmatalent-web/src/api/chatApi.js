import { api } from './client'

export async function fetchChatMessages(applicationId) {
  const { data } = await api.get(`/shift-applications/${applicationId}/chat-messages`)
  return data
}

export async function sendChatMessage(applicationId, payload) {
  const { data } = await api.post(`/shift-applications/${applicationId}/chat-messages`, payload)
  return data
}
