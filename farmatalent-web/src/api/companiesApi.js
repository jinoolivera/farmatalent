import { api } from './client'

export async function fetchCompanies(params = {}) {
  const { data } = await api.get('/companies', { params })
  return data
}

export async function fetchCompanyById(companyId) {
  const { data } = await api.get(`/companies/${companyId}`)
  return data
}

export async function createCompany(payload) {
  const { data } = await api.post('/companies', payload)
  return data
}

export async function updateCompany(companyId, payload) {
  const { data } = await api.put(`/companies/${companyId}`, payload)
  return data
}
