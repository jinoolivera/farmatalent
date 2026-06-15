import { useEffect, useReducer, useCallback } from 'react'
import { fetchShifts } from '../api/shiftsApi'
import { fetchMyApplications } from '../api/applicationsApi'
import { api } from '../api/client'

const initialState = {
  shifts: [],
  applications: [],
  metrics: null,
  loadingShifts: true,
  loadingApplications: true,
  loadingMetrics: true,
  errorShifts: null,
  errorApplications: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SHIFTS_OK':       return { ...state, shifts: action.payload, loadingShifts: false }
    case 'SHIFTS_ERR':      return { ...state, errorShifts: action.payload, loadingShifts: false }
    case 'APPS_OK':         return { ...state, applications: action.payload, loadingApplications: false }
    case 'APPS_ERR':        return { ...state, errorApplications: action.payload, loadingApplications: false }
    case 'METRICS_OK':      return { ...state, metrics: action.payload, loadingMetrics: false }
    case 'METRICS_ERR':     return { ...state, loadingMetrics: false }
    default:                return state
  }
}

export function useDashboardData() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const load = useCallback(() => {
    fetchShifts({ limit: 10 })
      .then((data) => dispatch({ type: 'SHIFTS_OK', payload: Array.isArray(data?.data ?? data) ? (data?.data ?? data) : [] }))
      .catch((err) => dispatch({ type: 'SHIFTS_ERR', payload: err?.message ?? 'Error' }))

    fetchMyApplications()
      .then((data) => dispatch({ type: 'APPS_OK', payload: Array.isArray(data?.data ?? data) ? (data?.data ?? data) : [] }))
      .catch((err) => dispatch({ type: 'APPS_ERR', payload: err?.message ?? 'Error' }))

    api.get('/metrics/mine')
      // WorkerMetricResource wraps in { data: {...} } — unwrap to the metric object
      .then(({ data }) => dispatch({ type: 'METRICS_OK', payload: data?.data ?? data }))
      .catch(() => dispatch({ type: 'METRICS_ERR' }))
  }, [])

  useEffect(() => { load() }, [load])

  return { ...state, refresh: load }
}
