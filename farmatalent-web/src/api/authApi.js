import { api } from './client'

export async function login(credentials) {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function logout() {
  const { data } = await api.post('/auth/logout')
  return data
}

export async function requestPasswordReset(payload) {
  const { data } = await api.post('/auth/forgot-password', payload)
  return data
}

export async function resetPassword(payload) {
  const { data } = await api.post('/auth/reset-password', payload)
  return data
}

/** POST /email/resend — reenvía el correo de verificación al usuario autenticado */
export async function resendVerificationEmail() {
  const { data } = await api.post('/email/resend')
  return data
}
