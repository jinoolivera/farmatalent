import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export function getApiErrorMessage(error, fallback = 'Ocurrio un error inesperado.') {
  const firstValidationError = error?.response?.data?.errors
    ? Object.values(error.response.data.errors)?.[0]?.[0]
    : null

  return firstValidationError ?? error?.response?.data?.message ?? fallback
}
